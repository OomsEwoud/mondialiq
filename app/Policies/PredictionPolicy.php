<?php

namespace App\Policies;

use App\Enums\PredictionTypes;
use App\Models\Prediction;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PredictionPolicy
{
    public function update(User $user, Prediction $prediction): Response
    {
        if ($prediction->user_id !== $user->id) {
            return Response::deny('You do not own this prediction.');
        }

        if ($prediction->source !== PredictionTypes::User) {
            return Response::deny('AI predictions cannot be edited.');
        }

        if (! $prediction->isEditable()) {
            return Response::deny('This prediction can no longer be edited.');
        }

        return Response::allow();
    }
}
