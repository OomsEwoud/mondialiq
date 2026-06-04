<?php

namespace App\Filament\Resources\FixtureEvents\Schemas;

use App\Filament\Resources\FixtureEvents\FixtureEventResource;
use App\Models\Fixture;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class FixtureEventForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Event details')
                    ->description('Use these fields to correct visible match event data.')
                    ->columns(3)
                    ->schema([
                        TextInput::make('time_elapsed')
                            ->label('Minute')
                            ->numeric()
                            ->minValue(0)
                            ->required(),

                        TextInput::make('extra_time')
                            ->label('Extra time')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('type')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('detail')
                            ->maxLength(255),

                        TextInput::make('team_name')
                            ->label('Team name')
                            ->maxLength(255),

                        TextInput::make('player_name')
                            ->label('Player name')
                            ->maxLength(255),

                        TextInput::make('assist_name')
                            ->label('Assist name')
                            ->maxLength(255),

                        Textarea::make('comments')
                            ->columnSpanFull(),
                    ]),

                Section::make('Event relationships')
                    ->description('Only super admins can change structural event links.')
                    ->columns(2)
                    ->schema([
                        Select::make('fixture_id')
                            ->label('Fixture')
                            ->relationship('fixture', 'id')
                            ->getOptionLabelFromRecordUsing(fn (Fixture $record): string => self::fixtureLabel($record))
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (): bool => ! FixtureEventResource::userIsSuperAdmin()),

                        Select::make('team_id')
                            ->label('Team')
                            ->relationship('team', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (): bool => ! FixtureEventResource::userIsSuperAdmin()),

                        Select::make('player_id')
                            ->label('Player')
                            ->relationship('player', 'display_name')
                            ->searchable()
                            ->preload()
                            ->disabled(fn (): bool => ! FixtureEventResource::userIsSuperAdmin()),

                        Select::make('assist_id')
                            ->label('Assist')
                            ->relationship('assist', 'display_name')
                            ->searchable()
                            ->preload()
                            ->disabled(fn (): bool => ! FixtureEventResource::userIsSuperAdmin()),
                    ]),
            ]);
    }

    private static function fixtureLabel(Fixture $fixture): string
    {
        $homeTeam = $fixture->homeTeam?->name ?? 'Home team';
        $awayTeam = $fixture->awayTeam?->name ?? 'Away team';

        return "{$homeTeam} vs {$awayTeam} (#{$fixture->id})";
    }
}
