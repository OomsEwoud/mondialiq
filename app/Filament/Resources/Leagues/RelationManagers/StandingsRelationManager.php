<?php

namespace App\Filament\Resources\Leagues\RelationManagers;

use App\Filament\Resources\Leagues\LeagueResource;
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
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class StandingsRelationManager extends RelationManager
{
    protected static string $relationship = 'standings';

    protected static ?string $modelLabel = 'standing';

    protected static ?string $pluralModelLabel = 'standings';

    public static function canViewForRecord(Model $ownerRecord, string $pageClass): bool
    {
        return LeagueResource::userCanManageLeagues();
    }

    protected function canCreate(): bool
    {
        return LeagueResource::userIsSuperAdmin();
    }

    protected function canEdit(Model $record): bool
    {
        return LeagueResource::userCanManageLeagues();
    }

    protected function canDelete(Model $record): bool
    {
        return LeagueResource::userIsSuperAdmin();
    }

    protected function canDeleteAny(): bool
    {
        return LeagueResource::userIsSuperAdmin();
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Standing identity')
                    ->columns(2)
                    ->schema([
                        Select::make('team_id')
                            ->label('Team')
                            ->relationship('team', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),

                        TextInput::make('group_name')
                            ->label('Group')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('season')
                            ->required()
                            ->numeric(),

                        TextInput::make('rank')
                            ->required()
                            ->numeric()
                            ->minValue(1),
                    ]),

                Section::make('Match record')
                    ->columns(4)
                    ->schema([
                        TextInput::make('matches_played')->label('Played')->numeric()->minValue(0),
                        TextInput::make('wins')->numeric()->minValue(0),
                        TextInput::make('draws')->numeric()->minValue(0),
                        TextInput::make('losses')->numeric()->minValue(0),
                    ]),

                Section::make('Goals and points')
                    ->columns(4)
                    ->schema([
                        TextInput::make('goals_for')->label('Goals for')->numeric()->minValue(0),
                        TextInput::make('goals_against')->label('Goals against')->numeric()->minValue(0),
                        TextInput::make('goal_difference')->label('Goal difference')->numeric(),
                        TextInput::make('points')->numeric()->minValue(0),
                    ]),

                Section::make('Form metrics')
                    ->columns(3)
                    ->schema([
                        TextInput::make('form')->maxLength(10),
                        TextInput::make('attacking_form')->label('Attacking form')->maxLength(255),
                        TextInput::make('defensive_form')->label('Defensive form')->maxLength(255),
                        TextInput::make('goals_scored_last_5')->label('Goals scored last 5')->numeric()->minValue(0),
                        TextInput::make('goals_conceded_last_5')->label('Goals conceded last 5')->numeric()->minValue(0),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query
                ->with('team')
                ->orderBy('group_name')
                ->orderBy('rank'))
            ->columns([
                TextColumn::make('group_name')->label('Group')->searchable()->limit(14),
                TextColumn::make('rank')->label('Rank')->sortable(),
                TextColumn::make('team.name')->label('Team')->searchable()->limit(22),
                TextColumn::make('matches_played')->label('MP')->sortable(),
                TextColumn::make('wins')->label('W')->sortable(),
                TextColumn::make('draws')->label('D')->sortable(),
                TextColumn::make('losses')->label('L')->sortable(),
                TextColumn::make('goals_for')->label('GF')->sortable(),
                TextColumn::make('goals_against')->label('GA')->sortable(),
                TextColumn::make('goal_difference')->label('GD')->sortable(),
                TextColumn::make('points')->label('Pts')->sortable(),
                TextColumn::make('season')->sortable(),
            ])
            ->headerActions([
                CreateAction::make()
                    ->visible(fn (): bool => LeagueResource::userIsSuperAdmin()),
            ])
            ->recordActions([
                EditAction::make()
                    ->visible(fn () => Auth::user()?->hasAnyRole(['admin', 'super_admin'])),
                DeleteAction::make()
                    ->visible(fn (): bool => LeagueResource::userIsSuperAdmin()),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->visible(fn (): bool => LeagueResource::userIsSuperAdmin()),
                ]),
            ]);
    }
}
