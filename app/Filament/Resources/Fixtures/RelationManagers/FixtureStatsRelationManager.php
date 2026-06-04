<?php

namespace App\Filament\Resources\Fixtures\RelationManagers;

use App\Filament\Resources\Fixtures\FixtureResource;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class FixtureStatsRelationManager extends RelationManager
{
    protected static string $relationship = 'fixtureStats';

    protected static ?string $modelLabel = 'stat';

    protected static ?string $pluralModelLabel = 'stats';

    public static function canViewForRecord(Model $ownerRecord, string $pageClass): bool
    {
        return FixtureResource::userCanManageFixtures();
    }

    protected function canCreate(): bool
    {
        return FixtureResource::userCanManageFixtures();
    }

    protected function canEdit(Model $record): bool
    {
        return FixtureResource::userCanManageFixtures();
    }

    protected function canDelete(Model $record): bool
    {
        return FixtureResource::userIsSuperAdmin();
    }

    protected function canDeleteAny(): bool
    {
        return FixtureResource::userIsSuperAdmin();
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Stat details')
                    ->columns(3)
                    ->schema([
                        Select::make('team_id')
                            ->label('Team')
                            ->options(fn (): array => FixturePlayersRelationManager::fixtureTeamOptionsFor($this->getOwnerRecord()))
                            ->searchable()
                            ->required()
                            ->disabled(fn (string $operation): bool => $operation === 'edit' && ! FixtureResource::userIsSuperAdmin()),

                        TextInput::make('name')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('value')
                            ->required()
                            ->numeric(),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query
                ->with('team')
                ->orderBy('team_id')
                ->orderBy('name'))
            ->columns([
                TextColumn::make('team.name')
                    ->label('Team')
                    ->searchable()
                    ->limit(20),

                TextColumn::make('name')
                    ->searchable()
                    ->limit(24),

                TextColumn::make('value')
                    ->numeric(decimalPlaces: 2)
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('team_id')
                    ->label('Team')
                    ->options(fn (): array => FixturePlayersRelationManager::fixtureTeamOptionsFor($this->getOwnerRecord()))
                    ->searchable(),
            ])
            ->headerActions([
                CreateAction::make()
                    ->visible(fn (): bool => FixtureResource::userCanManageFixtures()),
            ])
            ->recordActions([
                EditAction::make()
                    ->visible(fn () => Auth::user()?->hasAnyRole(['admin', 'super_admin']))
                    ->using(function (Model $record, array $data): Model {
                        if (! FixtureResource::userIsSuperAdmin()) {
                            unset($data['team_id']);
                        }

                        $record->update($data);

                        return $record;
                    }),

                DeleteAction::make()
                    ->visible(fn (): bool => FixtureResource::userIsSuperAdmin()),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->visible(fn (): bool => FixtureResource::userIsSuperAdmin()),
                ]),
            ]);
    }
}
