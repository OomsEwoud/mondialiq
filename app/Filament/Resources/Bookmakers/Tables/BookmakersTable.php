<?php

namespace App\Filament\Resources\Bookmakers\Tables;

use App\Filament\Resources\Bookmakers\BookmakerResource;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class BookmakersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('fixture_odds_count')
                    ->label('Odds entries')
                    ->tooltip('Number of fixture odds linked to this bookmaker.')
                    ->sortable(),
            ])
            ->filters([])
            ->recordActions([
                EditAction::make()
                    ->visible(fn (): bool => BookmakerResource::userIsSuperAdmin()),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->visible(fn (): bool => BookmakerResource::userIsSuperAdmin()),
                ]),
            ]);
    }
}
