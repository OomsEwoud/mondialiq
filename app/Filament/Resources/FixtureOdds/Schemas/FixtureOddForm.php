<?php

namespace App\Filament\Resources\FixtureOdds\Schemas;

use App\Models\Fixture;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class FixtureOddForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Fixture and market')
                    ->description('Manually added odds supplement missing API data and can influence prediction output.')
                    ->columns(2)
                    ->schema([
                        Select::make('fixture_id')
                            ->label('Fixture')
                            ->relationship('fixture', 'id')
                            ->getOptionLabelFromRecordUsing(fn (Fixture $record): string => self::fixtureLabel($record))
                            ->searchable()
                            ->preload()
                            ->required(),

                        Select::make('bookmaker_id')
                            ->label('Bookmaker')
                            ->relationship('bookmaker', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),

                        Select::make('bet_type_id')
                            ->label('Bet type')
                            ->relationship('betType', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                    ]),

                Section::make('Odds value')
                    ->description('Use these fields to correct or supplement odds used by prediction logic.')
                    ->columns(3)
                    ->schema([
                        TextInput::make('value')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('odd')
                            ->required()
                            ->numeric()
                            ->minValue(1),

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
