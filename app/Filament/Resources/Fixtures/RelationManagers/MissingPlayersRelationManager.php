<?php

namespace App\Filament\Resources\Fixtures\RelationManagers;

use App\Filament\Resources\Fixtures\FixtureResource;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
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

class MissingPlayersRelationManager extends RelationManager
{
    protected static string $relationship = 'missingPlayerRecords';

    protected static ?string $modelLabel = 'missing player';

    protected static ?string $pluralModelLabel = 'missing players';

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
                Section::make('Missing player details')
                    ->columns(2)
                    ->schema([
                        Select::make('player_id')
                            ->label('Player')
                            ->relationship('player', 'display_name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (string $operation): bool => $operation === 'edit' && ! FixtureResource::userIsSuperAdmin()),

                        TextInput::make('type')
                            ->required()
                            ->maxLength(255)
                            ->placeholder('injured, suspended, unavailable'),

                        Textarea::make('reason')
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query
                ->with('player')
                ->orderBy('type')
                ->orderBy('player_id'))
            ->columns([
                TextColumn::make('player.display_name')
                    ->label('Player')
                    ->searchable()
                    ->limit(24),

                TextColumn::make('type')
                    ->badge()
                    ->searchable()
                    ->color(fn (?string $state): string => self::typeColor($state)),

                TextColumn::make('reason')
                    ->searchable()
                    ->limit(40),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->options(fn (): array => $this->getOwnerRecord()
                        ->missingPlayerRecords()
                        ->whereNotNull('type')
                        ->distinct()
                        ->orderBy('type')
                        ->pluck('type', 'type')
                        ->all())
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
                            unset($data['player_id']);
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

    private static function typeColor(?string $type): string
    {
        return match (strtolower((string) $type)) {
            'injured', 'injury' => 'danger',
            'suspended', 'suspension' => 'warning',
            'doubtful', 'unavailable' => 'info',
            default => 'gray',
        };
    }
}
