<?php

use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

test('missing pages render the custom inertia error page', function () {
    $this
        ->get('/this-match-does-not-exist')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 404)
        );
});

test('handled http errors render the custom inertia error page', function (int $status) {
    Route::get("/__test/errors/{$status}", fn () => abort($status));

    $this
        ->get("/__test/errors/{$status}")
        ->assertStatus($status)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', $status)
        );
})->with([
    'forbidden' => 403,
    'page expired' => 419,
    'too many requests' => 429,
    'server error' => 500,
    'service unavailable' => 503,
]);

test('json requests keep the default json error response', function () {
    $this
        ->getJson('/this-api-match-does-not-exist')
        ->assertNotFound()
        ->assertJsonMissing([
            'component' => 'error',
        ]);
});
