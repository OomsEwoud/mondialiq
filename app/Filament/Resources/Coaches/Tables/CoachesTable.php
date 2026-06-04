<?php

namespace App\Filament\Resources\Coaches\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class CoachesTable
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
                    ->label('Coach')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('team.name')
                    ->label('Team')
                    ->searchable()
                    ->limit(24),

                TextColumn::make('country.name')
                    ->label('Country')
                    ->searchable()
                    ->limit(20),

                TextColumn::make('birth_date')
                    ->label('Birth date')
                    ->date('d M Y')
                    ->sortable(),
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
