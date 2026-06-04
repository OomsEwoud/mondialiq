<?php

namespace App\Filament\Resources\Referees\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class RefereeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Referee details')
                    ->columns(1)
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                    ]),
            ]);
    }
}
