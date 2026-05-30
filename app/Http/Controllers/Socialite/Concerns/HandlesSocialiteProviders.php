<?php

namespace App\Http\Controllers\Socialite\Concerns;

trait HandlesSocialiteProviders
{
    private const SUPPORTED_PROVIDERS = ['google', 'facebook'];

    private function ensureSupportedProvider(string $provider): void
    {
        abort_unless(in_array($provider, self::SUPPORTED_PROVIDERS, true), 404);
    }
}
