<?php

namespace App\Http\Controllers\Socialite;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Socialite\Concerns\HandlesSocialiteProviders;
use Illuminate\Http\Request;
use Laravel\Socialite\Socialite;

class RedirectController extends Controller
{
    use HandlesSocialiteProviders;

    public function __invoke(Request $request, string $provider)
    {
        $this->ensureSupportedProvider($provider);
        $callbackUrl = $this->callbackUrl($provider);

        $request->session()->put(
            $this->callbackUrlSessionKey($provider),
            $callbackUrl,
        );

        return Socialite::driver($provider)
            ->redirectUrl($callbackUrl)
            ->redirect();
    }
}
