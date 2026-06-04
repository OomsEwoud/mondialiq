<?php

namespace App\Filament\Resources\FixturePlayers\Tables;

use App\Models\Fixture;
use App\Models\FixturePlayer;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class FixturePlayersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('fixture_id')
                    ->state(fn (FixturePlayer $record): string => self::fixtureLabel($record))
                    ->label('Fixture')
                    ->searchable(query: function ($query, string $search) {
                        return $query->whereHas('fixture', fn ($query) => $query
                            ->whereHas('homeTeam', fn ($query) => $query->where('name', 'like', "%{$search}%"))
                            ->orWhereHas('awayTeam', fn ($query) => $query->where('name', 'like', "%{$search}%")));
                    })
                    ->limit(28),

                TextColumn::make('team.name')
                    ->label('Team')
                    ->searchable()
                    ->limit(20),

                TextColumn::make('player.display_name')
                    ->label('Player')
                    ->searchable()
                    ->limit(24),

                IconColumn::make('is_starting')
                    ->label('Starting')
                    ->boolean(),

                TextColumn::make('jersey_number')
                    ->label('No.')
                    ->sortable(),

                TextColumn::make('position')
                    ->searchable()
                    ->limit(16),
            ])
            ->filters([
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

                SelectFilter::make('team_id')
                    ->label('Team')
                    ->relationship('team', 'name')
                    ->searchable()
                    ->preload(),

                TernaryFilter::make('is_starting')
                    ->label('Starting')
                    ->placeholder('All players')
                    ->trueLabel('Starting')
                    ->falseLabel('Bench'),
            ])
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

    private static function fixtureLabel(FixturePlayer $fixturePlayer): string
    {
        if (! $fixturePlayer->fixture) {
            return "Fixture #{$fixturePlayer->fixture_id}";
        }

        $homeTeam = $fixturePlayer->fixture->homeTeam?->name ?? 'Home team';
        $awayTeam = $fixturePlayer->fixture->awayTeam?->name ?? 'Away team';

        return "{$homeTeam} vs {$awayTeam}";
    }

    private static function fixtureOptionLabel(Fixture $fixture): string
    {
        $homeTeam = $fixture->homeTeam?->name ?? 'Home team';
        $awayTeam = $fixture->awayTeam?->name ?? 'Away team';
        $kickoff = $fixture->match_date?->format('d M Y H:i');

        return trim("{$homeTeam} vs {$awayTeam} {$kickoff}");
    }
}
