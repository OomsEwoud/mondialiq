<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class EditAccountController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $props = [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'canManageTwoFactor' => Features::canManageTwoFactorAuthentication(),
            'accountUser' => $this->accountUser($request),
            'predictionPreferences' => $this->predictionPreferences($request),
        ];

        if (Features::canManageTwoFactorAuthentication()) {
            $props['twoFactorEnabled'] = $request->user()
                ->hasEnabledTwoFactorAuthentication();

            $props['requiresConfirmation'] = Features::optionEnabled(
                Features::twoFactorAuthentication(),
                'confirm',
            );
        }

        return Inertia::render('settings/profile', $props);
    }

    /**
     * @return array<string, mixed>
     */
    private function accountUser(Request $request): array
    {
        $user = $request->user();
        $hasPassword = filled($user->getAttribute('password'));

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatarUrl(),
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
            'social_provider' => $user->getAttribute('social_provider'),
            'has_password' => $hasPassword,
            'is_sso_only' => ! $hasPassword && filled($user->getAttribute('social_provider')),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function predictionPreferences(Request $request): array
    {
        $preference = $request->user()->userPreference();

        return [
            'predictions_visibility' => $preference->predictions_visibility,
            'default_prediction_visibility' => $preference->default_prediction_visibility,
            'show_on_leaderboards' => $preference->show_on_leaderboards,
            'allow_group_visibility' => $preference->allow_group_visibility,
        ];
    }
}
