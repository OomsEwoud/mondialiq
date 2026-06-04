<?php

namespace App\Filament\Resources\Predictions\Schemas;

use App\Enums\PredictionTypes;
use App\Filament\Resources\Predictions\PredictionResource;
use App\Models\Fixture;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class PredictionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Prediction identity')
                    ->columns(2)
                    ->schema([
                        Select::make('fixture_id')
                            ->label('Fixture')
                            ->relationship('fixture', 'id')
                            ->getOptionLabelFromRecordUsing(fn (Fixture $record): string => self::fixtureLabel($record))
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (): bool => ! PredictionResource::userIsSuperAdmin()),

                        Select::make('source')
                            ->options(self::sourceOptions())
                            ->required()
                            ->disabled(fn (): bool => ! PredictionResource::userIsSuperAdmin()),

                        Select::make('user_id')
                            ->label('User')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->disabled(fn (): bool => ! PredictionResource::userIsSuperAdmin()),

                        Select::make('winner_id')
                            ->label('Winner')
                            ->relationship('winner', 'name')
                            ->searchable()
                            ->preload()
                            ->disabled(fn (): bool => ! PredictionResource::userIsSuperAdmin()),
                    ]),

                Section::make('Prediction result')
                    ->columns(3)
                    ->schema([
                        TextInput::make('home_goals')
                            ->label('Home goals')
                            ->numeric()
                            ->minValue(0)
                            ->disabled(fn (): bool => ! PredictionResource::userIsSuperAdmin()),

                        TextInput::make('away_goals')
                            ->label('Away goals')
                            ->numeric()
                            ->minValue(0)
                            ->disabled(fn (): bool => ! PredictionResource::userIsSuperAdmin()),

                        TextInput::make('total_goals')
                            ->label('Total goals')
                            ->numeric()
                            ->minValue(0)
                            ->disabled(fn (): bool => ! PredictionResource::userIsSuperAdmin()),

                        Textarea::make('advice')
                            ->columnSpanFull()
                            ->disabled(fn (): bool => ! PredictionResource::userIsSuperAdmin()),
                    ]),

                Section::make('Chances and confidence')
                    ->columns(4)
                    ->schema([
                        TextInput::make('confidence')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->disabled(fn (): bool => ! PredictionResource::userIsSuperAdmin()),

                        TextInput::make('home_chance')
                            ->label('Home chance')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->disabled(fn (): bool => ! PredictionResource::userIsSuperAdmin()),

                        TextInput::make('draw_chance')
                            ->label('Draw chance')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->disabled(fn (): bool => ! PredictionResource::userIsSuperAdmin()),

                        TextInput::make('away_chance')
                            ->label('Away chance')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->disabled(fn (): bool => ! PredictionResource::userIsSuperAdmin()),
                    ]),

                Section::make('Scoring')
                    ->description('Only super admins can change awarded points and scoring timestamps.')
                    ->columns(2)
                    ->schema([
                        TextInput::make('points')
                            ->numeric()
                            ->minValue(0)
                            ->disabled(fn (): bool => ! PredictionResource::userIsSuperAdmin()),

                        DateTimePicker::make('points_awarded_at')
                            ->label('Points awarded at')
                            ->seconds(false)
                            ->disabled(fn (): bool => ! PredictionResource::userIsSuperAdmin()),
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

    private static function sourceOptions(): array
    {
        return collect(PredictionTypes::cases())
            ->mapWithKeys(fn (PredictionTypes $type): array => [$type->value => $type->label()])
            ->all();
    }
}
