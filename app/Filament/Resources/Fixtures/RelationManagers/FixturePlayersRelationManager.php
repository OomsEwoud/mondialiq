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
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class FixturePlayersRelationManager extends RelationManager
{
    protected static string $relationship = 'fixturePlayers';

    protected static ?string $modelLabel = 'lineup player';

    protected static ?string $pluralModelLabel = 'lineup players';

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
                Section::make('Lineup details')
                    ->description('Use these fields to correct starting status, shirt number and match position.')
                    ->columns(3)
                    ->schema([
                        Toggle::make('is_starting')
                            ->label('Starting')
                            ->inline(false),

                        TextInput::make('jersey_number')
                            ->label('Jersey number')
                            ->numeric()
                            ->minValue(0),

                        Select::make('position')
                            ->options([
                                'G' => 'Goalkeeper',
                                'D' => 'Defender',
                                'M' => 'Midfielder',
                                'F' => 'Forward',
                            ])
                            ->searchable(),
                    ]),

                Section::make('Links')
                    ->description('The parent fixture is set automatically. Only super admins can change links after creation.')
                    ->columns(2)
                    ->schema([
                        Select::make('team_id')
                            ->label('Team')
                            ->options(fn (): array => $this->fixtureTeamOptions())
                            ->searchable()
                            ->required()
                            ->disabled(fn (string $operation): bool => $operation === 'edit' && ! FixtureResource::userIsSuperAdmin()),

                        Select::make('player_id')
                            ->label('Player')
                            ->relationship('player', 'display_name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (string $operation): bool => $operation === 'edit' && ! FixtureResource::userIsSuperAdmin()),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query
                ->with(['player', 'team'])
                ->orderBy('team_id')
                ->orderByDesc('is_starting')
                ->orderBy('position')
                ->orderBy('jersey_number'))
            ->columns([
                TextColumn::make('team.name')
                    ->label('Team')
                    ->searchable()
                    ->limit(20),

                TextColumn::make('player.display_name')
                    ->label('Player')
                    ->searchable()
                    ->limit(24),

                IconColumn::make('is_starting')
                    ->label('Starting')
                    ->boolean(),

                TextColumn::make('jersey_number')
                    ->label('No.')
                    ->sortable(),

                TextColumn::make('position')
                    ->searchable()
                    ->limit(16),
            ])
            ->filters([
                SelectFilter::make('team_id')
                    ->label('Team')
                    ->options(fn (): array => $this->fixtureTeamOptions())
                    ->searchable(),

                TernaryFilter::make('is_starting')
                    ->label('Starting')
                    ->placeholder('All players')
                    ->trueLabel('Starting')
                    ->falseLabel('Bench'),
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
                            unset($data['team_id'], $data['player_id']);
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

    private function fixtureTeamOptions(): array
    {
        $fixture = $this->getOwnerRecord()->loadMissing(['awayTeam', 'homeTeam']);

        $teams = collect([$fixture->homeTeam, $fixture->awayTeam])->filter();

        return $teams
            ->mapWithKeys(fn (Model $team): array => [$team->getKey() => $team->getAttribute('name')])
            ->all();
    }
}
