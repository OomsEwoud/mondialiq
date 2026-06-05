<?php

use App\Http\Requests\Feedback\StoreFeedbackRequest;
use App\Models\FeedbackMessage;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the contact page is public', function () {
    $this
        ->get(route('contact'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('contact')
            ->has('categories', count(StoreFeedbackRequest::CATEGORIES))
        );
});

test('guests cannot submit feedback', function () {
    $this
        ->post(route('feedback.store'), [
            'category' => 'Suggestion',
            'subject' => 'Add a knockout bracket',
            'message' => 'A bracket view would make the tournament easier to scan.',
        ])
        ->assertRedirect(route('login'));

    expect(FeedbackMessage::query()->count())->toBe(0);
});

test('a logged in user can submit feedback', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->post(route('feedback.store'), [
            'category' => 'Wrong match data',
            'subject' => 'Wrong venue on match page',
            'message' => 'The Belgium match shows the wrong stadium.',
            'related_url' => '/matches/10',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('feedback_messages', [
        'user_id' => $user->id,
        'category' => 'Wrong match data',
        'subject' => 'Wrong venue on match page',
        'message' => 'The Belgium match shows the wrong stadium.',
        'related_url' => '/matches/10',
    ]);
});

test('feedback can be marked as handled and reopened', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();

    $feedback = FeedbackMessage::create([
        'user_id' => $user->id,
        'category' => 'UI bug or glitch',
        'subject' => 'Button overlaps on mobile',
        'message' => 'The submit button overlaps the footer on a small viewport.',
    ]);

    expect($feedback->isHandled())->toBeFalse();

    $feedback->markAsHandled($admin);

    $feedback->refresh();

    expect($feedback->isHandled())->toBeTrue()
        ->and($feedback->handled_by)->toBe($admin->id)
        ->and($feedback->handled_at)->not->toBeNull();

    $feedback->markAsOpen();

    $feedback->refresh();

    expect($feedback->isHandled())->toBeFalse()
        ->and($feedback->handled_by)->toBeNull()
        ->and($feedback->handled_at)->toBeNull();
});

test('feedback requires category subject and message', function (
    string $field,
    array $payload,
) {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->post(route('feedback.store'), [
            'category' => 'Suggestion',
            'subject' => 'Improve filters',
            'message' => 'Please add a filter for finished matches.',
            ...$payload,
        ])
        ->assertSessionHasErrors($field);

    expect(FeedbackMessage::query()->count())->toBe(0);
})->with([
    'category' => ['category', ['category' => '']],
    'subject' => ['subject', ['subject' => '']],
    'message' => ['message', ['message' => '']],
    'valid category' => ['category', ['category' => 'Not a real category']],
]);

test('the feedback endpoint is protected and rate limited', function () {
    $middleware = app('router')
        ->getRoutes()
        ->getByName('feedback.store')
        ->gatherMiddleware();

    expect($middleware)->toContain('auth')
        ->and($middleware)->toContain('throttle:feedback-store');
});
