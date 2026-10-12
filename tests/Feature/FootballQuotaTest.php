<?php

use App\Services\Apis\ApiPriority;
use App\Services\Apis\ApiQuota;
use App\Services\Apis\FootballApiBudget;
use App\Services\Apis\FootballApiBudgetExceeded;
use App\Services\Apis\FootballApiService;
use GuzzleHttp\Psr7\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;

beforeEach(function () {
    config(['services.api_football.base_url' => 'https://api-football.test', 'services.api_football.api_key' => 'quota-test', 'api-football.competitions' => '39:2026,140:2025']);
    Http::preventStrayRequests();
    Sleep::fake();
});

function quotaResponse(int $remaining, int $limit = 7500, int $minute = 200): Illuminate\Http\Client\Response
{
    return new Illuminate\Http\Client\Response(new Response(200, [
        'x-ratelimit-requests-limit' => (string) $limit,
        'x-ratelimit-requests-remaining' => (string) $remaining,
        'X-RateLimit-Limit' => '300', 'X-RateLimit-Remaining' => (string) $minute,
    ], '{"response":[]}'));
}

test('quota parses exact documented headers and keeps unknown values unknown', function () {
    $quota = ApiQuota::fromResponse(quotaResponse(6000));
    expect($quota->dailyLimit)->toBe(7500)->and($quota->dailyRemaining)->toBe(6000)
        ->and($quota->minuteLimit)->toBe(300)->and($quota->minuteRemaining)->toBe(200)
        ->and($quota->remainingPercent())->toBe(80.0);
    $empty = ApiQuota::fromResponse(new Illuminate\Http\Client\Response(new Response(200, ['X-RateLimit-Remaining' => 'invalid'])));
    expect($empty->dailyLimit)->toBeNull()->and($empty->minuteRemaining)->toBeNull();
});

test('quota gates priorities by percentages and reserve', function (int $remaining, string $status, array $allowed) {
    $budget = app(FootballApiBudget::class);
    $budget->observe(quotaResponse($remaining));
    expect($budget->status())->toBe($status);
    foreach (ApiPriority::cases() as $priority) {
        expect($budget->canExecute($priority))->toBe(in_array($priority->value, $allowed, true));
    }
})->with([
    [6000, 'HEALTHY', [0, 1, 2, 3, 4]],
    [1875, 'WARNING', [0, 1, 2]],
    [750, 'CRITICAL', [0, 1]],
    [500, 'RESERVE', [0]],
    [0, 'EXHAUSTED', []],
]);

test('thresholds scale to larger subscriptions', function (int $limit) {
    $budget = app(FootballApiBudget::class);
    $budget->observe(quotaResponse((int) ($limit * .2), $limit));
    expect($budget->canExecute(ApiPriority::Background))->toBeFalse()
        ->and($budget->canExecute(ApiPriority::Critical))->toBeTrue();
})->with([7500, 75000, 150000]);

test('local reservations protect the minute reserve and recover after the minute', function () {
    $budget = app(FootballApiBudget::class);
    $budget->observe(quotaResponse(6000, minute: 3));
    $budget->reserve(ApiPriority::Normal, false);
    expect($budget->available(ApiPriority::Normal))->toBeFalse()->and($budget->available(ApiPriority::Critical))->toBeTrue();
    $budget->reserve(ApiPriority::Critical, false);
    $budget->reserve(ApiPriority::Critical, false);
    expect($budget->available())->toBeFalse();
    $this->travel(61)->seconds();
    expect($budget->available())->toBeTrue();
});

test('old day quota does not block the next UTC day', function () {
    $budget = app(FootballApiBudget::class);
    $budget->observe(quotaResponse(0));
    expect($budget->available())->toBeFalse();
    $this->travelTo(now('UTC')->addDay()->startOfDay()->addSecond());
    expect($budget->status())->toBe('UNKNOWN')->and($budget->available())->toBeTrue();
});

test('background requests are deferred without HTTP and critical requests proceed', function () {
    $budget = app(FootballApiBudget::class);
    $budget->observe(quotaResponse(600));
    Http::fake(['*' => Http::response(['response' => []])]);
    expect(fn () => app(FootballApiService::class)->getCountries())->toThrow(FootballApiBudgetExceeded::class);
    app(FootballApiService::class)->getFixture(100);
    Http::assertSentCount(1);
});

test('quota status and usage are read without HTTP', function () {
    $budget = app(FootballApiBudget::class);
    $budget->observe(quotaResponse(6000));
    $budget->recordUsage('/fixtures', 'football:sync');
    Http::fake();
    $this->artisan('football:api-status')->expectsOutputToContain('HEALTHY')
        ->expectsOutputToContain('Ouderdom')->expectsOutputToContain('/fixtures')->assertSuccessful();
    Http::assertNothingSent();
});

test('client caches requests and counts only actual attempts', function () {
    Http::fake(['*' => Http::response(['response' => []], 200, ['x-ratelimit-requests-limit' => '7500', 'x-ratelimit-requests-remaining' => '6000'])]);
    $api = app(FootballApiService::class);
    $api->getFixture(1);
    $api->getFixture(1);
    $api->getFixture(2);
    Http::assertSentCount(2);
    expect(array_sum(app(FootballApiBudget::class)->usage()['/fixtures']))->toBe(2);
});

test('permanent http errors are not retried', function (int $status) {
    Http::fake(['*' => Http::response(['response' => []], $status)]);
    expect(fn () => app(FootballApiService::class)->getFixture(1))->toThrow(RuntimeException::class);
    Http::assertSentCount(1);
})->with([400, 401, 403]);

test('server errors retry once and count both requests', function () {
    Http::fake(['*' => Http::sequence()->push([], 503)->push(['response' => []])]);
    app(FootballApiService::class)->getFixture(1);
    Http::assertSentCount(2);
    expect(array_sum(app(FootballApiBudget::class)->usage()['/fixtures']))->toBe(2);
});

test('429 respects a Retry-After HTTP date without an immediate retry', function () {
    Http::fake(['*' => Http::response(['response' => []], 429, ['Retry-After' => gmdate('D, d M Y H:i:s', time() + 180).' GMT'])]);
    expect(fn () => app(FootballApiService::class)->getFixture(1))->toThrow(RuntimeException::class);
    expect(app(FootballApiBudget::class)->available())->toBeFalse();
    Http::assertSentCount(1);
});

test('invalid threshold ordering fails clearly', function () {
    config(['api-football.quota.warning_percent' => 5]);
    expect(fn () => app(FootballApiBudget::class)->status())->toThrow(InvalidArgumentException::class);
});

test('status works without credentials while actual requests reject missing credentials', function () {
    config(['services.api_football.api_key' => null]);
    Http::fake();
    $this->artisan('football:api-status')->expectsOutputToContain('UNKNOWN')->assertSuccessful();
    expect(fn () => app(FootballApiService::class)->getCountries())->toThrow(RuntimeException::class, 'configuratie ontbreekt');
    Http::assertNothingSent();
});
