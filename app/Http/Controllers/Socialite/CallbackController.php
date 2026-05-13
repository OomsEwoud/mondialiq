<?php

namespace App\Http\Controllers\Socialite;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Socialite\Concerns\HandlesSocialiteProviders;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Socialite;

class CallbackController extends Controller
{
    use HandlesSocialiteProviders;

    public function __invoke(string $provider)
    {
        $this->ensureSupportedProvider($provider);

        $newUser = Socialite::driver($provider)->user();
        $email = $newUser->getEmail();

        abort_if(blank($email), 422, 'No email address was returned by the social provider.');

        $user = User::firstOrCreate(
            ['email' => $newUser->getEmail()],
            [
                'name' => $newUser->getName() ?: $newUser->getNickname() ?: $email,
                'email_verified_at' => now(),
            ],
        );

        Auth::login($user);

        return redirect()->route('home');
    }
}
