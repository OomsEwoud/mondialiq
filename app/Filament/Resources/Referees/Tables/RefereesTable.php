<?php

namespace App\Filament\Resources\Referees\Tables;

use App\Filament\Resources\Referees\RefereeResource;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class RefereesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('fixtures_count')
                    ->label('Matches')
                    ->tooltip('Number of fixtures assigned to this referee.')
                    ->sortable(),

                TextColumn::make('latest_match_date')
                    ->label('Latest match')
                    ->dateTime('d M Y H:i')
                    ->placeholder('-')
                    ->sortable(),

                TextColumn::make('next_match_date')
                    ->label('Next match')
                    ->dateTime('d M Y H:i')
                    ->placeholder('-')
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
                        ->visible(fn (): bool => RefereeResource::userIsSuperAdmin()),
                ]),
            ]);
    }
}
