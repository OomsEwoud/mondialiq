<?php

namespace App\Filament\Resources\MissingPlayers\Tables;

use App\Models\Fixture;
use App\Models\MissingPlayer;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class MissingPlayersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('fixture_id')
                    ->state(fn (MissingPlayer $record): string => self::fixtureLabel($record))
                    ->label('Fixture')
                    ->searchable(query: function ($query, string $search) {
                        return $query->whereHas('fixture', fn ($query) => $query
                            ->whereHas('homeTeam', fn ($query) => $query->where('name', 'like', "%{$search}%"))
                            ->orWhereHas('awayTeam', fn ($query) => $query->where('name', 'like', "%{$search}%")));
                    })
                    ->limit(28),

                TextColumn::make('player.display_name')
                    ->label('Player')
                    ->searchable()
                    ->limit(24),

                TextColumn::make('type')
                    ->badge()
                    ->searchable()
                    ->color(fn (?string $state): string => self::typeColor($state)),

                TextColumn::make('reason')
                    ->searchable()
                    ->limit(40),
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

                SelectFilter::make('type')
                    ->options(fn (): array => MissingPlayer::query()
                        ->whereNotNull('type')
                        ->distinct()
                        ->orderBy('type')
                        ->pluck('type', 'type')
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

    private static function fixtureLabel(MissingPlayer $missingPlayer): string
    {
        if (! $missingPlayer->fixture) {
            return "Fixture #{$missingPlayer->fixture_id}";
        }

        $homeTeam = $missingPlayer->fixture->homeTeam?->name ?? 'Home team';
        $awayTeam = $missingPlayer->fixture->awayTeam?->name ?? 'Away team';

        return "{$homeTeam} vs {$awayTeam}";
    }

    private static function fixtureOptionLabel(Fixture $fixture): string
    {
        $homeTeam = $fixture->homeTeam?->name ?? 'Home team';
        $awayTeam = $fixture->awayTeam?->name ?? 'Away team';
        $kickoff = $fixture->match_date?->format('d M Y H:i');

        return trim("{$homeTeam} vs {$awayTeam} {$kickoff}");
    }

    private static function typeColor(?string $type): string
    {
        return match (strtolower((string) $type)) {
            'injured', 'injury' => 'danger',
            'suspended', 'suspension' => 'warning',
            'doubtful', 'unavailable' => 'info',
            default => 'gray',
        };
    }
}
