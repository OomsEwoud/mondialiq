<?php

namespace App\Filament\Resources\FixtureEvents\Tables;

use App\Models\FixtureEvent;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class FixtureEventsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('fixture_id')
                    ->state(fn (FixtureEvent $record): string => self::fixtureLabel($record))
                    ->label('Fixture')
                    ->searchable(query: function ($query, string $search) {
                        return $query->whereHas('fixture', fn ($query) => $query
                            ->whereHas('homeTeam', fn ($query) => $query->where('name', 'like', "%{$search}%"))
                            ->orWhereHas('awayTeam', fn ($query) => $query->where('name', 'like', "%{$search}%")));
                    })
                    ->limit(28),

                TextColumn::make('time_elapsed')
                    ->label('Minute')
                    ->formatStateUsing(fn (?int $state): string => $state === null ? '-' : "{$state}'")
                    ->sortable(),

                TextColumn::make('extra_time')
                    ->label('Extra')
                    ->formatStateUsing(fn (?int $state): string => $state === null ? '-' : "+{$state}'"),

                TextColumn::make('team_name')
                    ->label('Team')
                    ->searchable()
                    ->limit(20),

                TextColumn::make('player_name')
                    ->label('Player')
                    ->searchable()
                    ->limit(22),

                TextColumn::make('assist_name')
                    ->label('Assist')
                    ->searchable()
                    ->limit(22)
                    ->toggleable(),

                TextColumn::make('type')
                    ->badge()
                    ->searchable()
                    ->color(fn (?string $state): string => self::typeColor($state)),

                TextColumn::make('detail')
                    ->searchable()
                    ->limit(24),

                TextColumn::make('comments')
                    ->limit(32)
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('event_key')
                    ->label('Event key')
                    ->limit(12)
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->options(fn (): array => FixtureEvent::query()
                        ->whereNotNull('type')
                        ->distinct()
                        ->orderBy('type')
                        ->pluck('type', 'type')
                        ->all()),
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

    private static function fixtureLabel(FixtureEvent $event): string
    {
        if (! $event->fixture) {
            return "Fixture #{$event->fixture_id}";
        }

        $homeTeam = $event->fixture->homeTeam?->name ?? 'Home team';
        $awayTeam = $event->fixture->awayTeam?->name ?? 'Away team';

        return "{$homeTeam} vs {$awayTeam}";
    }

    private static function typeColor(?string $type): string
    {
        return match (strtolower((string) $type)) {
            'goal' => 'success',
            'card' => 'warning',
            'subst', 'substitution' => 'info',
            'var' => 'gray',
            default => 'primary',
        };
    }
}
