<?php

namespace App\Http\Requests\Leagues;

use App\Models\Scoreboard;
use Illuminate\Foundation\Http\FormRequest;

class LeaveLeagueRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Scoreboard $scoreboard */
        $scoreboard = $this->route('scoreboard');

        return $this->user()?->can('leave', $scoreboard) ?? false;
    }

    public function rules(): array
    {
        return [];
    }
}
