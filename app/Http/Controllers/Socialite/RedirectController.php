<?php

namespace App\Http\Controllers\Socialite;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Socialite\Concerns\HandlesSocialiteProviders;
use Laravel\Socialite\Socialite;

class RedirectController extends Controller
{
    use HandlesSocialiteProviders;

    public function __invoke(string $provider)
    {
        $this->ensureSupportedProvider($provider);

        return Socialite::driver($provider)
            ->redirectUrl($this->callbackUrl($provider))
            ->redirect();
    }
}
