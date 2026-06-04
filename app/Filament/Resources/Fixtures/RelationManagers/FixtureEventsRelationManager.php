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

class FixtureEventsRelationManager extends RelationManager
{
    protected static string $relationship = 'fixtureEvents';

    protected static ?string $modelLabel = 'event';

    protected static ?string $pluralModelLabel = 'events';

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
                Section::make('Event details')
                    ->columns(3)
                    ->schema([
                        TextInput::make('time_elapsed')
                            ->label('Minute')
                            ->numeric()
                            ->minValue(0)
                            ->required(),

                        TextInput::make('extra_time')
                            ->label('Extra')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('type')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('detail')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('team_name')
                            ->label('Team name')
                            ->maxLength(255),

                        TextInput::make('player_name')
                            ->label('Player name')
                            ->maxLength(255),

                        TextInput::make('assist_name')
                            ->label('Assist name')
                            ->maxLength(255),

                        Textarea::make('comments')
                            ->columnSpanFull(),
                    ]),

                Section::make('Links')
                    ->description('The parent fixture is set automatically. Only super admins can change structural links after creation.')
                    ->columns(3)
                    ->schema([
                        Select::make('team_id')
                            ->label('Team')
                            ->options(fn (): array => FixturePlayersRelationManager::fixtureTeamOptionsFor($this->getOwnerRecord()))
                            ->searchable()
                            ->required()
                            ->disabled(fn (string $operation): bool => $operation === 'edit' && ! FixtureResource::userIsSuperAdmin()),

                        Select::make('player_id')
                            ->label('Player')
                            ->relationship('player', 'display_name')
                            ->searchable()
                            ->preload()
                            ->disabled(fn (string $operation): bool => $operation === 'edit' && ! FixtureResource::userIsSuperAdmin()),

                        Select::make('assist_id')
                            ->label('Assist')
                            ->relationship('assist', 'display_name')
                            ->searchable()
                            ->preload()
                            ->disabled(fn (string $operation): bool => $operation === 'edit' && ! FixtureResource::userIsSuperAdmin()),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query
                ->with(['assist', 'player', 'team'])
                ->orderBy('time_elapsed')
                ->orderBy('extra_time'))
            ->columns([
                TextColumn::make('time_elapsed')
                    ->label('Min')
                    ->formatStateUsing(fn (?int $state): string => $state === null ? '-' : "{$state}'")
                    ->sortable(),

                TextColumn::make('extra_time')
                    ->label('+')
                    ->formatStateUsing(fn (?int $state): string => $state === null ? '-' : "+{$state}'"),

                TextColumn::make('team_name')
                    ->label('Team')
                    ->searchable()
                    ->limit(18),

                TextColumn::make('player_name')
                    ->label('Player')
                    ->searchable()
                    ->limit(22),

                TextColumn::make('type')
                    ->badge()
                    ->searchable()
                    ->color(fn (?string $state): string => self::typeColor($state)),

                TextColumn::make('detail')
                    ->searchable()
                    ->limit(24),
            ])
            ->filters([
                SelectFilter::make('team_id')
                    ->label('Team')
                    ->options(fn (): array => FixturePlayersRelationManager::fixtureTeamOptionsFor($this->getOwnerRecord()))
                    ->searchable(),

                SelectFilter::make('type')
                    ->options(fn (): array => $this->getOwnerRecord()
                        ->fixtureEvents()
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
                            unset($data['team_id'], $data['player_id'], $data['assist_id']);
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
            'goal' => 'success',
            'card' => 'warning',
            'subst', 'substitution' => 'info',
            default => 'gray',
        };
    }
}
