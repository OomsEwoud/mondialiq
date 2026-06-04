<?php

namespace App\Filament\Resources\Countries\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class CountryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),

                TextInput::make('fifa_code')
                    ->label('FIFA code')
                    ->maxLength(10),

                TextInput::make('flag_url')
                    ->label('Flag URL')
                    ->url()
                    ->maxLength(2048)
                    ->placeholder('https://example.com/flag.svg')
                    ->helperText('Use this field to correct a missing or incorrect country flag.'),
            ]);
    }
}
