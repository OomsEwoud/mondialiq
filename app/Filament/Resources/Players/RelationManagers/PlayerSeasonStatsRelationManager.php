<?php

namespace App\Filament\Resources\Players\RelationManagers;

use App\Filament\Resources\Players\PlayerResource;
use App\Filament\Resources\Players\Schemas\PlayerForm;
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
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class PlayerSeasonStatsRelationManager extends RelationManager
{
    protected static string $relationship = 'playerSeasonStats';

    protected static ?string $modelLabel = 'season stat';

    protected static ?string $pluralModelLabel = 'season stats';

    public static function canViewForRecord(Model $ownerRecord, string $pageClass): bool
    {
        return PlayerResource::userCanManagePlayers();
    }

    protected function canCreate(): bool
    {
        return PlayerResource::userIsSuperAdmin();
    }

    protected function canEdit(Model $record): bool
    {
        return PlayerResource::userCanManagePlayers();
    }

    protected function canDelete(Model $record): bool
    {
        return PlayerResource::userIsSuperAdmin();
    }

    protected function canDeleteAny(): bool
    {
        return PlayerResource::userIsSuperAdmin();
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Identity')
                    ->columns(4)
                    ->schema([
                        Select::make('league_id')
                            ->label('League')
                            ->relationship('league', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (string $operation): bool => $operation === 'edit' && ! PlayerResource::userIsSuperAdmin()),

                        TextInput::make('season')->required()->numeric(),
                        Select::make('position')
                            ->options(PlayerForm::positionOptions())
                            ->searchable(),
                        TextInput::make('rating')->numeric()->minValue(0),
                        Toggle::make('is_captain')->label('Captain'),
                    ]),

                Section::make('Basic performance')
                    ->columns(4)
                    ->schema([
                        TextInput::make('appearances')->numeric()->minValue(0),
                        TextInput::make('total_minutes')->label('Minutes')->numeric()->minValue(0),
                        TextInput::make('substitutes_in')->label('Substitutes in')->numeric()->minValue(0),
                        TextInput::make('substitutes_out')->label('Substitutes out')->numeric()->minValue(0),
                        TextInput::make('bench')->numeric()->minValue(0),
                        TextInput::make('total_saves')->label('Saves')->numeric()->minValue(0),
                        TextInput::make('total_goals_conceded')->label('Goals conceded')->numeric()->minValue(0),
                    ]),

                Section::make('Attacking')
                    ->columns(4)
                    ->schema([
                        TextInput::make('total_shots')->label('Shots')->numeric()->minValue(0),
                        TextInput::make('shots_on_target')->label('Shots on target')->numeric()->minValue(0),
                        TextInput::make('total_goals')->label('Goals')->numeric()->minValue(0),
                        TextInput::make('total_assists')->label('Assists')->numeric()->minValue(0),
                        TextInput::make('total_dribbles_attempts')->label('Dribbles attempts')->numeric()->minValue(0),
                        TextInput::make('dribbles_success')->label('Dribbles success')->numeric()->minValue(0),
                        TextInput::make('dribbles_past')->label('Dribbles past')->numeric()->minValue(0),
                    ]),

                Section::make('Passing')
                    ->columns(3)
                    ->schema([
                        TextInput::make('total_passes')->label('Passes')->numeric()->minValue(0),
                        TextInput::make('key_passes')->label('Key passes')->numeric()->minValue(0),
                        TextInput::make('pass_accuracy')->label('Pass accuracy')->numeric()->minValue(0),
                    ]),

                Section::make('Defensive')
                    ->columns(4)
                    ->schema([
                        TextInput::make('total_tackles')->label('Tackles')->numeric()->minValue(0),
                        TextInput::make('total_blocks')->label('Blocks')->numeric()->minValue(0),
                        TextInput::make('total_interceptions')->label('Interceptions')->numeric()->minValue(0),
                        TextInput::make('total_duels')->label('Duels')->numeric()->minValue(0),
                        TextInput::make('duels_won')->label('Duels won')->numeric()->minValue(0),
                        TextInput::make('fouls_drawn')->label('Fouls drawn')->numeric()->minValue(0),
                        TextInput::make('fouls_committed')->label('Fouls committed')->numeric()->minValue(0),
                    ]),

                Section::make('Discipline and penalties')
                    ->columns(4)
                    ->schema([
                        TextInput::make('yellow_cards')->label('Yellow cards')->numeric()->minValue(0),
                        TextInput::make('yellow_red_cards')->label('Yellow-red cards')->numeric()->minValue(0),
                        TextInput::make('red_cards')->label('Red cards')->numeric()->minValue(0),
                        TextInput::make('penalties_won')->label('Penalties won')->numeric()->minValue(0),
                        TextInput::make('penalties_committed')->label('Penalties committed')->numeric()->minValue(0),
                        TextInput::make('penalties_scored')->label('Penalties scored')->numeric()->minValue(0),
                        TextInput::make('penalties_missed')->label('Penalties missed')->numeric()->minValue(0),
                        TextInput::make('penalties_saved')->label('Penalties saved')->numeric()->minValue(0),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query
                ->with('league')
                ->orderByDesc('season'))
            ->columns([
                TextColumn::make('league.name')->label('League')->searchable()->limit(22),
                TextColumn::make('season')->sortable(),
                TextColumn::make('appearances')->label('Apps')->sortable(),
                TextColumn::make('total_minutes')->label('Min')->sortable(),
                TextColumn::make('position')->searchable()->limit(12),
                TextColumn::make('rating')->numeric(decimalPlaces: 1)->sortable(),
                TextColumn::make('total_goals')->label('Goals')->sortable(),
                TextColumn::make('total_assists')->label('Assists')->sortable(),
                TextColumn::make('yellow_cards')->label('YC')->sortable(),
                TextColumn::make('red_cards')->label('RC')->sortable(),
            ])
            ->filters([
                SelectFilter::make('league_id')
                    ->label('League')
                    ->relationship('league', 'name')
                    ->searchable()
                    ->preload(),

                SelectFilter::make('season')
                    ->options(fn (): array => $this->getOwnerRecord()
                        ->playerSeasonStats()
                        ->whereNotNull('season')
                        ->distinct()
                        ->orderByDesc('season')
                        ->pluck('season', 'season')
                        ->all()),

                SelectFilter::make('position')
                    ->options(PlayerForm::positionOptions())
                    ->searchable(),
            ])
            ->headerActions([
                CreateAction::make()
                    ->visible(fn (): bool => PlayerResource::userIsSuperAdmin()),
            ])
            ->recordActions([
                EditAction::make()
                    ->visible(fn () => Auth::user()?->hasAnyRole(['admin', 'super_admin']))
                    ->using(function (Model $record, array $data): Model {
                        if (! PlayerResource::userIsSuperAdmin()) {
                            unset($data['league_id']);
                        }

                        $record->update($data);

                        return $record;
                    }),
                DeleteAction::make()
                    ->visible(fn (): bool => PlayerResource::userIsSuperAdmin()),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->visible(fn (): bool => PlayerResource::userIsSuperAdmin()),
                ]),
            ]);
    }
}
