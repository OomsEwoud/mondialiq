<?php

namespace App\Filament\Resources\BetTypes\Tables;

use App\Filament\Resources\BetTypes\BetTypeResource;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class BetTypesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('fixture_odds_count')
                    ->label('Fixture odds')
                    ->sortable(),
            ])
            ->filters([])
            ->recordActions([
                EditAction::make()
                    ->visible(fn (): bool => BetTypeResource::userIsSuperAdmin()),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->visible(fn (): bool => BetTypeResource::userIsSuperAdmin()),
                ]),
            ]);
    }
}
