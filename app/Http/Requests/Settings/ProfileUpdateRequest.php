<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    public function rules(): array
    {
        if ($this->isSocialOnlyAccount()) {
            return [
                'name' => $this->nameRules(),
                'avatar' => $this->avatarRules(),
            ];
        }

        return $this->profileRules($this->user()->id);
    }

    private function isSocialOnlyAccount(): bool
    {
        return blank($this->user()->getAttribute('password'))
            && filled($this->user()->getAttribute('social_provider'));
    }
}
