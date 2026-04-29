<?php

namespace App\Enums;

enum PredictionTypes : string
{
    case User = 'user';
    case Ai = 'ai';
    case Api = 'archived';

    public function label(): string
    {
        return match($this) {
            self::User => 'Gebruiker',
            self::Ai => 'Ai',
            self::Api => 'Api',
        };
    }
}
