<?php

namespace App\Http\Requests\Leagues;

use App\Http\Requests\Leagues\Concerns\ResolvesLeagueRoutes;
use App\Support\Leagues\LeagueBranding;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeagueRequest extends FormRequest
{
    use ResolvesLeagueRoutes;

    public function authorize(): bool
    {
        return $this->user()?->can('manage', $this->league()) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'description' => ['nullable', 'string', 'max:1000'],
            'reward_title' => ['nullable', 'string', 'max:120'],
            'reward_description' => ['nullable', 'string', 'max:1000'],
            'visibility' => ['required', 'string', 'in:private,public'],
            'is_active' => ['required', 'boolean'],
            'icon' => ['required', 'string', Rule::in(LeagueBranding::icons())],
            'accent_color' => ['required', 'string', Rule::in(LeagueBranding::accentColors())],
            'cover_style' => ['required', 'string', Rule::in(LeagueBranding::coverStyles())],
        ];
    }
}
