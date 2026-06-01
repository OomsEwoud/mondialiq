<?php

namespace App\Services\Prediction;

use OpenAI\Laravel\Facades\OpenAI;

class OpenAiResponseClient
{
    /**
     * @param  array<string, mixed>  $parameters
     */
    public function create(array $parameters): object
    {
        return OpenAI::responses()->create($parameters);
    }
}
