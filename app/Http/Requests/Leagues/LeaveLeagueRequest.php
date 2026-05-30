<?php

namespace App\Http\Requests\Leagues;

use App\Http\Requests\Leagues\Concerns\ResolvesLeagueRoutes;
use Illuminate\Foundation\Http\FormRequest;

class LeaveLeagueRequest extends FormRequest
{
    use ResolvesLeagueRoutes;

    public function authorize(): bool
    {
        return $this->user()?->can('leave', $this->league()) ?? false;
    }

    public function rules(): array
    {
        return [];
    }
}
