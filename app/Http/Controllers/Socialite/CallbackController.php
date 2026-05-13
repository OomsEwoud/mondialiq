<?php

namespace App\Http\Controllers\Socialite;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Socialite;

class CallbackController extends Controller
{
    public function __invoke(string $provider)
    {
        abort_unless(in_array($provider, ['google', 'facebook'], true), 404);

        /** @var SocialiteUser $newUser */
        $newUser = Socialite::driver($provider)->user();
        $email = $newUser->getEmail();

        abort_if(blank($email), 422, 'No email address was returned by the social provider.');

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $newUser->getName() ?: $newUser->getNickname() ?: $email,
                'password' => Str::random(32),
                'email_verified_at' => now(),
            ],
        );

        $user->forceFill([
            'name' => $newUser->getName() ?: $newUser->getNickname() ?: $user->getAttribute('name'),
            'email_verified_at' => $user->getAttribute('email_verified_at') ?? now(),
        ])->save();

        Auth::login($user);

        return redirect()->route('home');
    }
}
