<?php

namespace App\Filament\Resources\Venues\Tables;

use App\Filament\Resources\Venues\VenueResource;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class VenuesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('photo_url')
                    ->label('Photo')
                    ->imageHeight(32),

                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->limit(24),

                TextColumn::make('city')
                    ->searchable()
                    ->sortable()
                    ->limit(20),

                TextColumn::make('country.name')
                    ->label('Country')
                    ->searchable()
                    ->limit(20),

                TextColumn::make('capacity')
                    ->numeric()
                    ->sortable(),

                TextColumn::make('fixtures_count')
                    ->label('Fixtures')
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
                        ->visible(fn (): bool => VenueResource::userIsSuperAdmin()),
                ]),
            ]);
    }
}
