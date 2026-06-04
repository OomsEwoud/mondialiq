<?php

namespace App\Filament\Resources\Fixtures\Schemas;

use App\Filament\Resources\Fixtures\FixtureResource;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class FixtureForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Match corrections')
                    ->columns(3)
                    ->schema([
                        TextInput::make('status_short')
                            ->label('Status short')
                            ->maxLength(255),

                        TextInput::make('status_long')
                            ->label('Status long')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('elapsed_time')
                            ->label('Minute')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('fulltime_home_goals')
                            ->label('Fulltime home goals')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('fulltime_away_goals')
                            ->label('Fulltime away goals')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('result')
                            ->maxLength(255),

                        TextInput::make('halftime_home_goals')
                            ->label('Halftime home goals')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('halftime_away_goals')
                            ->label('Halftime away goals')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('extratime_home_goals')
                            ->label('Extratime home goals')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('extratime_away_goals')
                            ->label('Extratime away goals')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('penalty_home_goals')
                            ->label('Penalty home goals')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('penalty_away_goals')
                            ->label('Penalty away goals')
                            ->numeric()
                            ->minValue(0),
                    ]),

                Section::make('Fixture details')
                    ->columns(2)
                    ->schema([
                        Select::make('league_id')
                            ->label('League')
                            ->relationship('league', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        Select::make('home_team_id')
                            ->label('Home team')
                            ->relationship('homeTeam', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        Select::make('away_team_id')
                            ->label('Away team')
                            ->relationship('awayTeam', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        Select::make('venue_id')
                            ->label('Venue')
                            ->relationship('venue', 'name')
                            ->searchable()
                            ->preload()
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        Select::make('referee_id')
                            ->label('Referee')
                            ->relationship('referee', 'name')
                            ->searchable()
                            ->preload()
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        DateTimePicker::make('match_date')
                            ->label('Match date')
                            ->required()
                            ->seconds(false)
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        TextInput::make('season')
                            ->numeric()
                            ->required()
                            ->minValue(0)
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        TextInput::make('round_name')
                            ->label('Round')
                            ->required()
                            ->maxLength(255)
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),
                    ]),
            ]);
    }
}
