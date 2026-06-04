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
                    ->description('Use these fields to correct delayed or incorrect API status data.')
                    ->columns(4)
                    ->schema([
                        Select::make('status_short')
                            ->label('Status short')
                            ->options([
                                'NS' => 'NS - Not Started',
                                '1H' => '1H - First Half',
                                'HT' => 'HT - Half Time',
                                '2H' => '2H - Second Half',
                                'ET' => 'ET - Extra Time',
                                'BT' => 'BT - Break Time',
                                'P' => 'P - Penalties',
                                'LIVE' => 'LIVE - In Progress',
                                'FT' => 'FT - Finished',
                                'AET' => 'AET - Finished After Extra Time',
                                'PEN' => 'PEN - Finished After Penalties',
                                'CANC' => 'CANC - Cancelled',
                                'PST' => 'PST - Postponed',
                            ])
                            ->searchable()
                            ->nullable()
                            ->helperText('Correct the short match status when the API is delayed.'),

                        TextInput::make('status_long')
                            ->label('Status long')
                            ->required()
                            ->maxLength(255)
                            ->helperText('Human-readable status shown in admin context.'),

                        TextInput::make('elapsed_time')
                            ->label('Minute')
                            ->numeric()
                            ->minValue(0),

                        Select::make('result')
                            ->options([
                                'H' => 'H - Home win',
                                'D' => 'D - Draw',
                                'A' => 'A - Away win',
                            ])
                            ->placeholder('No result yet')
                            ->nullable(),
                    ]),

                Section::make('Score details')
                    ->description('Use these fields to correct delayed or incorrect API score data.')
                    ->columns(4)
                    ->schema([
                        TextInput::make('halftime_home_goals')
                            ->label('Halftime home goals')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('halftime_away_goals')
                            ->label('Halftime away goals')
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
                    ->description('Only super admins can change structural fixture data.')
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
