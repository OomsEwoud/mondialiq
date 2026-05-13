<?php

namespace App\Http\Controllers\Socialite\Concerns;

trait HandlesSocialiteProviders
{
    private function ensureSupportedProvider(string $provider): void
    {
        abort_unless(in_array($provider, ['google', 'facebook'], true), 404);
    }

    private function callbackUrl(string $provider): string
    {
        return config("services.{$provider}.redirect")
            ?: route('auth.callback', ['provider' => $provider]);
    }
}
