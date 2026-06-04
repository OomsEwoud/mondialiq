<?php

namespace App\Filament\Resources\Venues\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class VenueForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Venue details')
                    ->columns(2)
                    ->schema([
                        TextInput::make('external_id')
                            ->label('External ID')
                            ->disabled()
                            ->dehydrated(false),

                        TextInput::make('name')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('city')
                            ->maxLength(255),

                        Select::make('country_id')
                            ->label('Country')
                            ->relationship('country', 'name')
                            ->searchable()
                            ->preload(),

                        TextInput::make('capacity')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('photo_url')
                            ->label('Photo URL')
                            ->url()
                            ->maxLength(2048)
                            ->placeholder('https://example.com/venue.jpg')
                            ->columnSpanFull(),
                    ]),
            ]);
    }
}
