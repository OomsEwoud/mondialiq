<?php

namespace App\Filament\Resources\Leagues\RelationManagers;

use App\Filament\Resources\Leagues\LeagueResource;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\DateTimePicker;
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

class TeamStatisticsRelationManager extends RelationManager
{
    protected static string $relationship = 'teamStatistics';

    protected static ?string $modelLabel = 'team statistic';

    protected static ?string $pluralModelLabel = 'team statistics';

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
                Section::make('Identity')
                    ->columns(3)
                    ->schema([
                        Select::make('team_id')
                            ->label('Team')
                            ->relationship('team', 'name')
                            ->searchable()
                            ->preload(),

                        TextInput::make('season')
                            ->required()
                            ->numeric(),

                        DatePicker::make('statistics_date')
                            ->label('Statistics date'),
                    ]),

                Section::make('Record')
                    ->columns(4)
                    ->schema([
                        TextInput::make('form')->maxLength(255),
                        TextInput::make('fixtures_played_total')->label('Played')->numeric()->minValue(0),
                        TextInput::make('wins_total')->label('Wins')->numeric()->minValue(0),
                        TextInput::make('draws_total')->label('Draws')->numeric()->minValue(0),
                        TextInput::make('losses_total')->label('Losses')->numeric()->minValue(0),
                        TextInput::make('goals_for_total')->label('Goals for')->numeric()->minValue(0),
                        TextInput::make('goals_against_total')->label('Goals against')->numeric()->minValue(0),
                        TextInput::make('most_used_formation')->label('Formation')->maxLength(255),
                    ]),

                Section::make('Metadata')
                    ->visible(fn (string $operation): bool => $operation === 'create' && LeagueResource::userIsSuperAdmin())
                    ->columns(3)
                    ->schema([
                        TextInput::make('statistics_key')
                            ->label('Statistics key')
                            ->required()
                            ->maxLength(255)
                            ->disabled(fn (): bool => ! LeagueResource::userIsSuperAdmin()),

                        TextInput::make('api_team_id')
                            ->label('API team ID')
                            ->required()
                            ->numeric()
                            ->disabled(fn (): bool => ! LeagueResource::userIsSuperAdmin()),

                        TextInput::make('api_league_id')
                            ->label('API league ID')
                            ->required()
                            ->numeric()
                            ->disabled(fn (): bool => ! LeagueResource::userIsSuperAdmin()),

                        DateTimePicker::make('fetched_at')
                            ->label('Fetched at')
                            ->seconds(false),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query
                ->with('team')
                ->orderByDesc('season')
                ->orderBy('team_id'))
            ->columns([
                TextColumn::make('team.name')->label('Team')->searchable()->limit(22),
                TextColumn::make('season')->sortable(),
                TextColumn::make('statistics_date')->label('Date')->date('d M Y')->sortable(),
                TextColumn::make('form')->limit(10)->placeholder('-'),
                TextColumn::make('fixtures_played_total')->label('MP')->sortable(),
                TextColumn::make('wins_total')->label('W')->sortable(),
                TextColumn::make('draws_total')->label('D')->sortable(),
                TextColumn::make('losses_total')->label('L')->sortable(),
                TextColumn::make('goals_for_total')->label('GF')->sortable(),
                TextColumn::make('goals_against_total')->label('GA')->sortable(),
                TextColumn::make('most_used_formation')->label('Formation')->limit(12),
                TextColumn::make('fetched_at')->label('Fetched')->dateTime('d M H:i')->sortable()->toggleable(),
            ])
            ->headerActions([
                CreateAction::make()
                    ->visible(fn (): bool => LeagueResource::userIsSuperAdmin()),
            ])
            ->recordActions([
                EditAction::make()
                    ->visible(fn () => Auth::user()?->hasAnyRole(['admin', 'super_admin']))
                    ->using(function (Model $record, array $data): Model {
                        if (! LeagueResource::userIsSuperAdmin()) {
                            unset($data['statistics_key'], $data['api_team_id'], $data['api_league_id']);
                        }

                        $record->update($data);

                        return $record;
                    }),

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
