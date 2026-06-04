<?php

namespace App\Filament\Resources\Standings\Tables;

use App\Models\Standing;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class StandingsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('group_name')
                    ->label('Group')
                    ->searchable()
                    ->sortable()
                    ->limit(14),

                TextColumn::make('rank')
                    ->label('Rank')
                    ->sortable(),

                TextColumn::make('team.name')
                    ->label('Team')
                    ->searchable()
                    ->sortable()
                    ->limit(22),

                TextColumn::make('matches_played')
                    ->label('MP')
                    ->sortable(),

                TextColumn::make('wins')
                    ->label('W')
                    ->sortable(),

                TextColumn::make('draws')
                    ->label('D')
                    ->sortable(),

                TextColumn::make('losses')
                    ->label('L')
                    ->sortable(),

                TextColumn::make('goals_for')
                    ->label('GF')
                    ->sortable(),

                TextColumn::make('goals_against')
                    ->label('GA')
                    ->sortable(),

                TextColumn::make('goal_difference')
                    ->label('GD')
                    ->sortable(),

                TextColumn::make('points')
                    ->label('Pts')
                    ->sortable(),

                TextColumn::make('qualification_chance')
                    ->label('Qual. %')
                    ->numeric(decimalPlaces: 1)
                    ->suffix('%')
                    ->placeholder('-')
                    ->sortable(),

                TextColumn::make('form')
                    ->limit(10)
                    ->placeholder('-'),

                TextColumn::make('league.name')
                    ->label('League')
                    ->searchable()
                    ->toggleable()
                    ->limit(18),

                TextColumn::make('season')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('group_name')
                    ->label('Group')
                    ->options(fn (): array => Standing::query()
                        ->whereNotNull('group_name')
                        ->distinct()
                        ->orderBy('group_name')
                        ->pluck('group_name', 'group_name')
                        ->all())
                    ->searchable(),

                SelectFilter::make('league_id')
                    ->label('League')
                    ->relationship('league', 'name')
                    ->searchable()
                    ->preload(),

                SelectFilter::make('season')
                    ->options(fn (): array => Standing::query()
                        ->whereNotNull('season')
                        ->distinct()
                        ->orderByDesc('season')
                        ->pluck('season', 'season')
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
}
