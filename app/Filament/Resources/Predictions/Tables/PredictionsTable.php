<?php

namespace App\Filament\Resources\Predictions\Tables;

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\Prediction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class PredictionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('fixture_id')
                    ->state(fn (Prediction $record): string => self::fixtureLabel($record))
                    ->label('Fixture')
                    ->limit(28),

                TextColumn::make('user.name')
                    ->label('User')
                    ->placeholder('-')
                    ->limit(18),

                TextColumn::make('source')
                    ->badge()
                    ->formatStateUsing(fn (PredictionTypes | string | null $state): string => self::sourceLabel($state))
                    ->color(fn (PredictionTypes | string | null $state): string => self::sourceColor($state)),

                TextColumn::make('winner.name')
                    ->label('Winner')
                    ->placeholder('-')
                    ->limit(18),

                TextColumn::make('score')
                    ->state(fn (Prediction $record): string => self::predictedScore($record))
                    ->label('Score'),

                TextColumn::make('confidence')
                    ->placeholder('-')
                    ->limit(12),

                TextColumn::make('points')
                    ->sortable(),

                TextColumn::make('points_awarded_at')
                    ->label('Scored at')
                    ->dateTime('d M Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('source')
                    ->options(self::sourceOptions()),

                TernaryFilter::make('scored')
                    ->label('Scoring')
                    ->placeholder('All')
                    ->trueLabel('Scored')
                    ->falseLabel('Unscored')
                    ->queries(
                        true: fn ($query) => $query->whereNotNull('points_awarded_at'),
                        false: fn ($query) => $query->whereNull('points_awarded_at'),
                    ),

                SelectFilter::make('fixture_id')
                    ->label('Fixture')
                    ->options(fn (): array => Fixture::query()
                        ->with(['awayTeam', 'homeTeam'])
                        ->orderByDesc('match_date')
                        ->get()
                        ->mapWithKeys(fn (Fixture $fixture): array => [
                            $fixture->id => self::fixtureOptionLabel($fixture),
                        ])
                        ->all())
                    ->searchable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->recordActions([
                EditAction::make()
                    ->visible(fn () => Auth::user()?->hasAnyRole(['admin', 'super_admin'])),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->visible(fn () => Auth::user()?->hasRole('super_admin')),
                ]),
            ]);
    }

    private static function fixtureLabel(Prediction $prediction): string
    {
        if (! $prediction->fixture) {
            return "Fixture #{$prediction->fixture_id}";
        }

        $homeTeam = $prediction->fixture->homeTeam?->name ?? 'Home team';
        $awayTeam = $prediction->fixture->awayTeam?->name ?? 'Away team';

        return "{$homeTeam} vs {$awayTeam}";
    }

    private static function fixtureOptionLabel(Fixture $fixture): string
    {
        $homeTeam = $fixture->homeTeam?->name ?? 'Home team';
        $awayTeam = $fixture->awayTeam?->name ?? 'Away team';
        $kickoff = $fixture->match_date?->format('d M Y H:i');

        return trim("{$homeTeam} vs {$awayTeam} {$kickoff}");
    }

    private static function predictedScore(Prediction $prediction): string
    {
        if ($prediction->home_goals === null || $prediction->away_goals === null) {
            return '-';
        }

        return "{$prediction->home_goals} - {$prediction->away_goals}";
    }

    private static function sourceOptions(): array
    {
        return collect(PredictionTypes::cases())
            ->mapWithKeys(fn (PredictionTypes $type): array => [$type->value => $type->label()])
            ->all();
    }

    private static function sourceLabel(PredictionTypes | string | null $source): string
    {
        if ($source instanceof PredictionTypes) {
            return $source->label();
        }

        return PredictionTypes::tryFrom((string) $source)?->label() ?? '-';
    }

    private static function sourceColor(PredictionTypes | string | null $source): string
    {
        $value = $source instanceof PredictionTypes ? $source : PredictionTypes::tryFrom((string) $source);

        return match ($value) {
            PredictionTypes::User => 'info',
            PredictionTypes::Ai => 'primary',
            PredictionTypes::Api => 'gray',
            default => 'gray',
        };
    }
}
