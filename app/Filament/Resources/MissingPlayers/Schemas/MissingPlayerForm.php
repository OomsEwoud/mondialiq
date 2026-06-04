<?php

namespace App\Filament\Resources\MissingPlayers\Schemas;

use App\Models\Fixture;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class MissingPlayerForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Missing player details')
                    ->description('Use this data to correct player availability for match detail pages and prediction context.')
                    ->columns(2)
                    ->schema([
                        Select::make('player_id')
                            ->label('Player')
                            ->relationship('player', 'display_name')
                            ->searchable()
                            ->preload()
                            ->required(),

                        TextInput::make('type')
                            ->required()
                            ->maxLength(255)
                            ->placeholder('injured, suspended, unavailable'),

                        Textarea::make('reason')
                            ->maxLength(65535)
                            ->columnSpanFull(),
                    ]),

                Section::make('Match link')
                    ->columns(1)
                    ->schema([
                        Select::make('fixture_id')
                            ->label('Fixture')
                            ->relationship('fixture', 'id')
                            ->getOptionLabelFromRecordUsing(fn (Fixture $record): string => self::fixtureLabel($record))
                            ->searchable()
                            ->preload()
                            ->required(),
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
