<?php

namespace App\Http\Requests\Settings;

use App\Concerns\PasswordValidationRules;
use Illuminate\Foundation\Http\FormRequest;

class ProfileDeleteRequest extends FormRequest
{
    use PasswordValidationRules;

    public function rules(): array
    {
        if (! $this->requiresPasswordConfirmation()) {
            return [];
        }

        return [
            'password' => $this->currentPasswordRules(),
        ];
    }

    private function requiresPasswordConfirmation(): bool
    {
        return filled($this->user()->getAttribute('password'));
    }
}
