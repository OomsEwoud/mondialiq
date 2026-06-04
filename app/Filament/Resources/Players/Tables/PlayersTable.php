<?php

namespace App\Filament\Resources\Players\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class PlayersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('photo_url')
                    ->label('Photo')
                    ->circular()
                    ->imageHeight(32),

                TextColumn::make('display_name')
                    ->label('Player')
                    ->searchable()
                    ->sortable()
                    ->limit(24),

                TextColumn::make('first_name')
                    ->label('First name')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->limit(18),

                TextColumn::make('last_name')
                    ->label('Last name')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->limit(18),

                TextColumn::make('country.name')
                    ->label('Country')
                    ->searchable()
                    ->limit(20),

                TextColumn::make('position')
                    ->searchable()
                    ->limit(18),

                TextColumn::make('number')
                    ->sortable(),

                TextColumn::make('external_id')
                    ->label('External ID')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([])
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
