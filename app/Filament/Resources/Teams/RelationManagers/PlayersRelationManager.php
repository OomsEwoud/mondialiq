<?php

namespace App\Filament\Resources\Teams\RelationManagers;

use App\Filament\Resources\Players\PlayerResource;
use App\Filament\Resources\Players\Schemas\PlayerForm;
use App\Filament\Resources\Teams\TeamResource;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DetachAction;
use Filament\Actions\DetachBulkAction;
use Filament\Actions\EditAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class PlayersRelationManager extends RelationManager
{
    protected static string $relationship = 'players';

    public static function canViewForRecord(Model $ownerRecord, string $pageClass): bool
    {
        return TeamResource::userCanManageTeams();
    }

    protected function canCreate(): bool
    {
        return TeamResource::userIsSuperAdmin();
    }

    protected function canEdit(Model $record): bool
    {
        return TeamResource::userCanManageTeams();
    }

    protected function canDelete(Model $record): bool
    {
        return TeamResource::userIsSuperAdmin();
    }

    protected function canDeleteAny(): bool
    {
        return TeamResource::userIsSuperAdmin();
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components(PlayerForm::schema());
    }

    public function table(Table $table): Table
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
                    ->sortable(),

                TextColumn::make('position')
                    ->searchable()
                    ->limit(18),

                TextColumn::make('number')
                    ->sortable(),

                TextColumn::make('country.name')
                    ->label('Country')
                    ->searchable()
                    ->limit(20),
            ])
            ->headerActions([
                CreateAction::make()
                    ->visible(fn (): bool => TeamResource::userIsSuperAdmin()),
            ])
            ->recordActions([
                EditAction::make()
                    ->visible(fn () => Auth::user()?->hasAnyRole(['admin', 'super_admin']))
                    ->url(fn (Model $record): string => PlayerResource::getUrl('edit', ['record' => $record])),

                DetachAction::make()
                    ->visible(fn (): bool => TeamResource::userIsSuperAdmin()),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DetachBulkAction::make()
                        ->visible(fn (): bool => TeamResource::userIsSuperAdmin()),
                ]),
            ]);
    }
}
