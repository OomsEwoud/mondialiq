<?php

namespace App\Filament\Resources\Standings\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class StandingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Standing identity')
                    ->columns(2)
                    ->schema([
                        Select::make('team_id')
                            ->label('Team')
                            ->relationship('team', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),

                        Select::make('league_id')
                            ->label('League')
                            ->relationship('league', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),

                        TextInput::make('group_name')
                            ->label('Group')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('season')
                            ->required()
                            ->numeric(),

                        TextInput::make('rank')
                            ->required()
                            ->numeric()
                            ->minValue(1),
                    ]),

                Section::make('Match record')
                    ->columns(4)
                    ->schema([
                        TextInput::make('matches_played')
                            ->label('Played')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('wins')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('draws')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('losses')
                            ->numeric()
                            ->minValue(0),
                    ]),

                Section::make('Goals and points')
                    ->columns(4)
                    ->schema([
                        TextInput::make('goals_for')
                            ->label('Goals for')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('goals_against')
                            ->label('Goals against')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('goal_difference')
                            ->label('Goal difference')
                            ->numeric(),

                        TextInput::make('points')
                            ->numeric()
                            ->minValue(0),
                    ]),

                Section::make('Form and prediction metrics')
                    ->columns(3)
                    ->schema([
                        TextInput::make('qualification_chance')
                            ->label('Qualification chance')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100),

                        TextInput::make('form')
                            ->maxLength(10),

                        TextInput::make('attacking_form')
                            ->label('Attacking form')
                            ->maxLength(255),

                        TextInput::make('defensive_form')
                            ->label('Defensive form')
                            ->maxLength(255),

                        TextInput::make('goals_scored_last_5')
                            ->label('Goals scored last 5')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('goals_conceded_last_5')
                            ->label('Goals conceded last 5')
                            ->numeric()
                            ->minValue(0),
                    ]),
            ]);
    }
}
