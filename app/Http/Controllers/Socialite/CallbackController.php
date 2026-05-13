<?php

namespace App\Http\Controllers\Socialite;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Socialite\Concerns\HandlesSocialiteProviders;
use App\Models\User;
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

        /** @var SocialiteUser $newUser */
        $newUser = Socialite::driver($provider)
            ->redirectUrl($this->callbackUrl($provider))
            ->user();
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
