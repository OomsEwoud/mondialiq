<?php

namespace App\Filament\Resources\Coaches\Schemas;

use App\Filament\Resources\Coaches\CoachResource;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class CoachForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Coach details')
                    ->columns(2)
                    ->schema([
                        TextInput::make('display_name')
                            ->label('Display name')
                            ->required()
                            ->maxLength(255),

                        DatePicker::make('birth_date')
                            ->label('Birth date'),

                        TextInput::make('first_name')
                            ->label('First name')
                            ->maxLength(255),

                        TextInput::make('last_name')
                            ->label('Last name')
                            ->maxLength(255),

                        TextInput::make('photo_url')
                            ->label('Photo URL')
                            ->url()
                            ->maxLength(2048)
                            ->placeholder('https://example.com/coach.jpg')
                            ->helperText('Use this field to correct a missing or incorrect coach photo.')
                            ->columnSpanFull(),
                    ]),

                Section::make('Coach links')
                    ->description('Only super admins can change structural links.')
                    ->columns(3)
                    ->schema([
                        Select::make('team_id')
                            ->label('Team')
                            ->relationship('team', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (): bool => ! CoachResource::userIsSuperAdmin()),

                        Select::make('country_id')
                            ->label('Country')
                            ->relationship('country', 'name')
                            ->searchable()
                            ->preload()
                            ->disabled(fn (): bool => ! CoachResource::userIsSuperAdmin()),
                    ]),
            ]);
    }
}
