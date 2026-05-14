<?php

namespace App\Http\Controllers\Socialite;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Socialite\Concerns\HandlesSocialiteProviders;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
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

        $providerId = $newUser->getId();
        $user = $providerId
            ? User::query()
                ->where('social_provider', $provider)
                ->where('social_provider_id', $providerId)
                ->first()
            : null;

        $user ??= User::firstOrNew(['email' => $email]);

        if (! $user->exists) {
            $user->password = null;
        }

        $attributes = [
            'email' => $email,
            'name' => $newUser->getName() ?: $newUser->getNickname() ?: $user->getAttribute('name') ?: $email,
            'email_verified_at' => $user->getAttribute('email_verified_at') ?? now(),
            'social_provider' => $provider,
            'social_provider_id' => $providerId,
        ];

        if (blank($user->getAttribute('avatar')) && filled($newUser->getAvatar())) {
            $attributes['avatar'] = $newUser->getAvatar();
            $attributes['avatar_type'] = $provider;
        }

        $user->forceFill($attributes)->save();

        Auth::login($user);

        return redirect()->route('home');
    }
}
