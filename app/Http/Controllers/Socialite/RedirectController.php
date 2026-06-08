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

        if ($request->has('intended')) {
            $request->session()->put('url.intended', $request->input('intended'));
        }

        return Socialite::driver($provider)->redirect();
    }
}
