<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Http\Responses\LoginResponse;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    private const LOGIN_RATE_LIMIT_PER_MINUTE = 5;

    private const TWO_FACTOR_RATE_LIMIT_PER_MINUTE = 5;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->app->singleton(LoginResponseContract::class, LoginResponse::class);

        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
        $this->configureAuthentication();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
            'intended' => $request->session()->get('url.intended'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('auth/register'));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(function (Request $request) {
            $this->storeIntendedUrl($request);

            return Inertia::render('auth/confirm-password');
        });
    }

    private function storeIntendedUrl(Request $request): void
    {
        $intended = $request->query('intended');

        if ($this->isSafeIntendedPath($intended)) {
            $request->session()->put('url.intended', $intended);
        }
    }

    private function isSafeIntendedPath(mixed $intended): bool
    {
        return is_string($intended)
            && str_starts_with($intended, '/')
            && ! str_starts_with($intended, '//');
    }

    /**
     * Configure authentication to reject system users.
     */
    private function configureAuthentication(): void
    {
        Fortify::authenticateUsing(function (Request $request) {
            $user = User::where(Fortify::username(), $request->{Fortify::username()})->first();

            if ($user?->is_system_user) {
                return null;
            }

            if ($user && Hash::check($request->password, $user->password)) {
                return $user;
            }

            return null;
        });
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(self::TWO_FACTOR_RATE_LIMIT_PER_MINUTE)
                ->by($this->twoFactorRateLimitKey($request));
        });

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(self::LOGIN_RATE_LIMIT_PER_MINUTE)
                ->by($this->loginRateLimitKey($request));
        });
    }

    private function twoFactorRateLimitKey(Request $request): string
    {
        return (string) ($request->session()->get('login.id') ?: $request->ip());
    }

    private function loginRateLimitKey(Request $request): string
    {
        return Str::transliterate(
            Str::lower((string) $request->input(Fortify::username())).'|'.$request->ip(),
        );
    }
}
