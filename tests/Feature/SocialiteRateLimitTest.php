<?php

test('social authentication endpoints are rate limited', function (string $routeName) {
    $middleware = app('router')
        ->getRoutes()
        ->getByName($routeName)
        ->gatherMiddleware();

    expect($middleware)->toContain('throttle:social-auth');
})->with([
    'redirect' => 'auth.redirect',
    'callback' => 'auth.callback',
]);
