<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Inertia\Response;
use Laravel\Fortify\Features;
use Illuminate\Http\Request;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Inertia\Inertia;

class EditAccountController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $props = [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'canManageTwoFactor' => Features::canManageTwoFactorAuthentication(),
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
}