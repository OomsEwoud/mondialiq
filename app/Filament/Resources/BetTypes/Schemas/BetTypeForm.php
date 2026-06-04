<?php

namespace App\Filament\Resources\BetTypes\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class BetTypeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Bet type details')
                    ->columns(1)
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                    ]),
            ]);
    }
}
