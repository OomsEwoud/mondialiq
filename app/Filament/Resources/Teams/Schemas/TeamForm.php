<?php

namespace App\Filament\Resources\Teams\Schemas;

use App\Filament\Resources\Teams\TeamResource;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class TeamForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Team details')
                    ->columns(2)
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('code')
                            ->maxLength(20),

                        TextInput::make('logo_url')
                            ->label('Logo URL')
                            ->url()
                            ->maxLength(2048)
                            ->placeholder('https://example.com/team.png'),

                        TextInput::make('founded_at')
                            ->label('Founded')
                            ->numeric()
                            ->minValue(0),
                    ]),

                Section::make('Team links')
                    ->description('Only super admins can change structural team links.')
                    ->columns(1)
                    ->schema([
                        Select::make('country_id')
                            ->label('Country')
                            ->relationship('country', 'name')
                            ->searchable()
                            ->preload()
                            ->disabled(fn (): bool => ! TeamResource::userIsSuperAdmin()),
                    ]),
            ]);
    }
}
