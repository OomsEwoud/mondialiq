<?php

namespace App\Http\Controllers\Socialite;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Socialite\Concerns\HandlesSocialiteProviders;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;

class CallbackController extends Controller
{
    use HandlesSocialiteProviders;

    public function __invoke(Request $request, string $provider): RedirectResponse
    {
        $this->ensureSupportedProvider($provider);

        if ($redirect = $this->failedCallbackRedirect($request, $provider)) {
            return $redirect;
        }

        $newUser = Socialite::driver($provider)->user();
        $email = $newUser->getEmail();

        abort_if(blank($email), 422, 'No email address was returned by the social provider.');

        $user = $this->resolveUser($newUser, $provider, $email);

        if (! $user->exists) {
            $user->password = null;
        }

        $user->forceFill($this->userAttributes($user, $newUser, $provider, $email))->save();

        Auth::login($user);

        return to_route('home');
    }

    private function failedCallbackRedirect(Request $request, string $provider): ?RedirectResponse
    {
        if ($request->has('error')) {
            return to_route('login')->withErrors([
                'socialite' => ucfirst($provider).' login was cancelled.',
            ]);
        }

        if (! $request->filled('code')) {
            return to_route('login')->withErrors([
                'socialite' => 'Social login could not be completed. Please try again.',
            ]);
        }

        return null;
    }

    private function resolveUser(SocialiteUser $newUser, string $provider, string $email): User
    {
        $providerId = $newUser->getId();
        $user = $providerId
            ? User::query()
                ->where('social_provider', $provider)
                ->where('social_provider_id', $providerId)
                ->first()
            : null;

        return $user ?? User::firstOrNew(['email' => $email]);
    }

    private function userAttributes(User $user, SocialiteUser $newUser, string $provider, string $email): array
    {
        $attributes = [
            'email' => $email,
            'name' => $newUser->getName() ?: $newUser->getNickname() ?: $user->getAttribute('name') ?: $email,
            'email_verified_at' => $user->getAttribute('email_verified_at') ?? now(),
            'social_provider' => $provider,
            'social_provider_id' => $newUser->getId(),
        ];

        if (blank($user->getAttribute('avatar')) && filled($newUser->getAvatar())) {
            $attributes['avatar'] = $newUser->getAvatar();
            $attributes['avatar_type'] = $provider;
        }

        return $attributes;
    }
}
