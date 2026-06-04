<?php

namespace App\Filament\Resources\Leagues\Schemas;

use App\Filament\Resources\Leagues\LeagueResource;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class LeagueForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('League details')
                    ->columns(2)
                    ->schema([
                        TextInput::make('external_id')
                            ->label('External ID')
                            ->disabled()
                            ->dehydrated(false),

                        TextInput::make('name')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('type')
                            ->maxLength(255),

                        TextInput::make('logo_url')
                            ->label('Logo URL')
                            ->url()
                            ->maxLength(2048)
                            ->placeholder('https://example.com/league.png')
                            ->columnSpanFull(),
                    ]),

                Section::make('League links')
                    ->description('Only super admins can change structural league links.')
                    ->columns(1)
                    ->schema([
                        Select::make('country_id')
                            ->label('Country')
                            ->relationship('country', 'name')
                            ->searchable()
                            ->preload()
                            ->disabled(fn (): bool => ! LeagueResource::userIsSuperAdmin()),
                    ]),
            ]);
    }
}
