<?php

namespace App\Filament\Resources\FixtureOdds\Tables;

use App\Models\FixtureOdd;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class FixtureOddsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('fixture_id')
                    ->state(fn (FixtureOdd $record): string => self::fixtureLabel($record))
                    ->label('Fixture')
                    ->limit(28),

                TextColumn::make('bookmaker_name')
                    ->label('Bookmaker')
                    ->searchable()
                    ->limit(22),

                TextColumn::make('bet_name')
                    ->label('Bet')
                    ->searchable()
                    ->limit(22),

                TextColumn::make('value')
                    ->searchable()
                    ->limit(18),

                TextColumn::make('odd')
                    ->numeric(decimalPlaces: 2)
                    ->sortable(),

                TextColumn::make('api_updated_at')
                    ->label('API updated')
                    ->dateTime('d M Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('bookmaker_id')
                    ->label('Bookmaker')
                    ->relationship('bookmaker', 'name')
                    ->searchable()
                    ->preload(),

                SelectFilter::make('bet_type_id')
                    ->label('Bet type')
                    ->relationship('betType', 'name')
                    ->searchable()
                    ->preload(),
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

    private static function fixtureLabel(FixtureOdd $odd): string
    {
        if (! $odd->fixture) {
            return "Fixture #{$odd->fixture_id}";
        }

        $homeTeam = $odd->fixture->homeTeam?->name ?? 'Home team';
        $awayTeam = $odd->fixture->awayTeam?->name ?? 'Away team';

        return "{$homeTeam} vs {$awayTeam}";
    }
}
