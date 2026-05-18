<?php

namespace App\Http\Controllers\Socialite;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Socialite\Concerns\HandlesSocialiteProviders;
use Laravel\Socialite\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse;

class RedirectController extends Controller
{
    use HandlesSocialiteProviders;

    public function __invoke(string $provider): RedirectResponse
    {
        $this->ensureSupportedProvider($provider);

        return Socialite::driver($provider)->redirect();
    }
}
