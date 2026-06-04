<?php

namespace App\Filament\Resources\FixturePlayers\Schemas;

use App\Filament\Resources\FixturePlayers\FixturePlayerResource;
use App\Models\Fixture;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class FixturePlayerForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Lineup details')
                    ->description('Use these fields to correct starting status, shirt number and match position.')
                    ->columns(3)
                    ->schema([
                        Toggle::make('is_starting')
                            ->label('Starting')
                            ->inline(false),

                        TextInput::make('jersey_number')
                            ->label('Jersey number')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('position')
                            ->maxLength(50),
                    ]),

                Section::make('Fixture/team links')
                    ->description('Only super admins can change structural lineup links.')
                    ->columns(3)
                    ->schema([
                        Select::make('fixture_id')
                            ->label('Fixture')
                            ->relationship('fixture', 'id')
                            ->getOptionLabelFromRecordUsing(fn (Fixture $record): string => self::fixtureLabel($record))
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (): bool => ! FixturePlayerResource::userIsSuperAdmin()),

                        Select::make('team_id')
                            ->label('Team')
                            ->relationship('team', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (): bool => ! FixturePlayerResource::userIsSuperAdmin()),

                        Select::make('player_id')
                            ->label('Player')
                            ->relationship('player', 'display_name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (): bool => ! FixturePlayerResource::userIsSuperAdmin()),
                    ]),
            ]);
    }

    private static function fixtureLabel(Fixture $fixture): string
    {
        $homeTeam = $fixture->homeTeam?->name ?? 'Home team';
        $awayTeam = $fixture->awayTeam?->name ?? 'Away team';
        $kickoff = $fixture->match_date?->format('d M Y H:i');

        return trim("{$homeTeam} vs {$awayTeam} {$kickoff}");
    }
}
