<?php

namespace App\Http\Requests\Leagues;

use App\Models\Scoreboard;
use App\Support\Leagues\LeagueBranding;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeagueRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Scoreboard $scoreboard */
        $scoreboard = $this->route('scoreboard');

        return $this->user()?->can('manage', $scoreboard) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'icon' => ['required', 'string', Rule::in(LeagueBranding::icons())],
            'accent_color' => ['required', 'string', Rule::in(LeagueBranding::accentColors())],
            'cover_style' => ['required', 'string', Rule::in(LeagueBranding::coverStyles())],
        ];
    }
}
