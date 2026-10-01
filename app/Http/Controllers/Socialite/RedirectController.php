<?php

namespace App\Http\Controllers\Socialite;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Socialite\Concerns\HandlesSocialiteProviders;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse;

class RedirectController extends Controller
{
    use HandlesSocialiteProviders;

    public function __invoke(Request $request, string $provider): RedirectResponse
    {
        $this->ensureSupportedProvider($provider);

        $request->session()->forget('url.intended');

        return Socialite::driver($provider)->redirect();
    }
}
