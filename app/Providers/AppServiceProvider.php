<?php

namespace App\Providers;

use App\Services\Apis\FootballApiContext;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Console\Events\CommandFinished;
use Illuminate\Console\Events\CommandStarting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(FootballApiContext::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimiting();
        Event::listen(CommandStarting::class, fn (CommandStarting $event) => app(FootballApiContext::class)->push($event->command ?? 'console'));
        Event::listen(CommandFinished::class, fn () => app(FootballApiContext::class)->pop());
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Configure rate limiters for app-owned routes.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('prediction-store', function (Request $request) {
            return Limit::perMinute(12)->by(
                $this->userOrIpRateLimitKey($request),
            );
        });

        RateLimiter::for('feedback-store', function (Request $request) {
            return Limit::perMinute(6)->by(
                $this->userOrIpRateLimitKey($request),
            );
        });

        RateLimiter::for('social-auth', function (Request $request) {
            return Limit::perMinute(10)->by(
                $request->route('provider').'|'.$request->ip(),
            );
        });

        RateLimiter::for('league-manage', function (Request $request) {
            return Limit::perMinute(12)->by(
                $this->userOrIpRateLimitKey($request),
            );
        });
    }

    private function userOrIpRateLimitKey(Request $request): string
    {
        return (string) ($request->user()?->id ?: $request->ip());
    }
}
