<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    private const REGISTER_RATE_LIMIT_PER_MINUTE = 3;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $this->ensureRegistrationIsNotRateLimited();

        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
        ]);
    }

    private function ensureRegistrationIsNotRateLimited(): void
    {
        $key = $this->registerRateLimitKey();

        if (RateLimiter::tooManyAttempts($key, self::REGISTER_RATE_LIMIT_PER_MINUTE)) {
            throw new TooManyRequestsHttpException(
                RateLimiter::availableIn($key),
                'Too many registration attempts. Please try again later.',
            );
        }

        RateLimiter::hit($key);
    }

    private function registerRateLimitKey(): string
    {
        return Str::transliterate('register|'.request()->ip());
    }
}
