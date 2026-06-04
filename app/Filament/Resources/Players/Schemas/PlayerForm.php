<?php

namespace App\Filament\Resources\Players\Schemas;

use App\Filament\Resources\Players\PlayerResource;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class PlayerForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Player profile')
                    ->columns(2)
                    ->schema([
                        TextInput::make('display_name')
                            ->label('Display name')
                            ->required()
                            ->maxLength(255),

                        Select::make('country_id')
                            ->label('Country')
                            ->relationship('country', 'name')
                            ->searchable()
                            ->preload()
                            ->disabled(fn (): bool => ! PlayerResource::userIsSuperAdmin()),

                        TextInput::make('first_name')
                            ->label('First name')
                            ->maxLength(255),

                        TextInput::make('last_name')
                            ->label('Last name')
                            ->maxLength(255),

                        DatePicker::make('birth_date')
                            ->label('Birth date'),

                        TextInput::make('number')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('position')
                            ->maxLength(255),

                        TextInput::make('photo_url')
                            ->label('Photo URL')
                            ->url()
                            ->maxLength(2048)
                            ->placeholder('https://example.com/player.jpg')
                            ->columnSpanFull(),
                    ]),

                Section::make('API metadata')
                    ->columns(1)
                    ->schema([
                        TextInput::make('external_id')
                            ->label('External ID')
                            ->disabled()
                            ->dehydrated(false),
                    ]),
            ]);
    }
}
