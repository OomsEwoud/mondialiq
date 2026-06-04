<?php

namespace App\Filament\Resources\Fixtures\Tables;

use App\Models\Fixture;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class FixturesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('homeTeam.name')
                    ->label('Home')
                    ->searchable()
                    ->limit(24),

                TextColumn::make('awayTeam.name')
                    ->label('Away')
                    ->searchable()
                    ->limit(24),

                TextColumn::make('league.name')
                    ->label('League')
                    ->toggleable()
                    ->limit(20),

                TextColumn::make('match_date')
                    ->label('Kickoff')
                    ->dateTime('d M Y H:i')
                    ->sortable(),

                TextColumn::make('status_short')
                    ->label('Status')
                    ->badge()
                    ->color(fn (?string $state): string => self::statusColor($state)),

                TextColumn::make('elapsed_time')
                    ->label('Minute')
                    ->formatStateUsing(fn (?int $state): string => $state === null ? '-' : "{$state}'"),

                TextColumn::make('score')
                    ->state(fn (Fixture $record): string => self::score($record))
                    ->label('Score'),

                TextColumn::make('round_name')
                    ->label('Round')
                    ->limit(24)
                    ->toggleable(),

                TextColumn::make('season')
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                Filter::make('live')
                    ->label('Live fixtures')
                    ->query(fn (Builder $query): Builder => $query->whereIn('status_short', Fixture::LIVE_STATUS_SHORTS)),

                Filter::make('finished')
                    ->label('Finished fixtures')
                    ->query(fn (Builder $query): Builder => $query->whereIn('status_short', Fixture::FINISHED_STATUS_SHORTS)),

                Filter::make('not_started')
                    ->label('Not started fixtures')
                    ->query(fn (Builder $query): Builder => $query->where('status_short', Fixture::NOT_STARTED_STATUS_SHORT)),
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

    private static function score(Fixture $fixture): string
    {
        if ($fixture->fulltime_home_goals === null || $fixture->fulltime_away_goals === null) {
            return '-';
        }

        return "{$fixture->fulltime_home_goals} - {$fixture->fulltime_away_goals}";
    }

    private static function statusColor(?string $status): string
    {
        return match (true) {
            in_array($status, Fixture::LIVE_STATUS_SHORTS, true) => 'success',
            in_array($status, Fixture::FINISHED_STATUS_SHORTS, true) => 'gray',
            $status === Fixture::NOT_STARTED_STATUS_SHORT => 'warning',
            default => 'info',
        };
    }
}
