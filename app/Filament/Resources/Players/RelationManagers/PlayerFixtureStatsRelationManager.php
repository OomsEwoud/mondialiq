<?php

namespace App\Filament\Resources\Players\RelationManagers;

use App\Filament\Resources\Players\PlayerResource;
use App\Models\Fixture;
use App\Models\PlayerFixtureStat;
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

class PlayerFixtureStatsRelationManager extends RelationManager
{
    protected static string $relationship = 'playerFixtureStats';

    protected static ?string $modelLabel = 'fixture stat';

    protected static ?string $pluralModelLabel = 'fixture stats';

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
                        Select::make('fixture_id')
                            ->label('Fixture')
                            ->relationship('fixture', 'id')
                            ->getOptionLabelFromRecordUsing(fn (Fixture $record): string => self::fixtureLabel($record))
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (string $operation): bool => $operation === 'edit' && ! PlayerResource::userIsSuperAdmin()),

                        TextInput::make('game_minutes')->label('Minutes')->numeric()->minValue(0),
                        TextInput::make('number')->numeric()->minValue(0),
                        TextInput::make('position')->maxLength(255),
                        TextInput::make('rating')->numeric()->minValue(0),
                        Toggle::make('is_captain')->label('Captain'),
                        Toggle::make('is_substitute')->label('Substitute'),
                    ]),

                Section::make('Basic performance')
                    ->columns(4)
                    ->schema([
                        TextInput::make('offsides')->numeric()->minValue(0),
                        TextInput::make('saves')->numeric()->minValue(0),
                        TextInput::make('goals_conceded')->label('Goals conceded')->numeric()->minValue(0),
                    ]),

                Section::make('Attacking')
                    ->columns(4)
                    ->schema([
                        TextInput::make('total_shots')->label('Shots')->numeric()->minValue(0),
                        TextInput::make('shots_on_target')->label('Shots on target')->numeric()->minValue(0),
                        TextInput::make('goals')->numeric()->minValue(0),
                        TextInput::make('assists')->numeric()->minValue(0),
                        TextInput::make('dribbles_attempts')->label('Dribbles attempts')->numeric()->minValue(0),
                        TextInput::make('dribbles_success')->label('Dribbles success')->numeric()->minValue(0),
                        TextInput::make('dribbles_past')->label('Dribbles past')->numeric()->minValue(0),
                    ]),

                Section::make('Passing')
                    ->columns(3)
                    ->schema([
                        TextInput::make('passes')->numeric()->minValue(0),
                        TextInput::make('key_passes')->label('Key passes')->numeric()->minValue(0),
                        TextInput::make('passes_accuracy')->label('Pass accuracy')->numeric()->minValue(0),
                    ]),

                Section::make('Defensive')
                    ->columns(4)
                    ->schema([
                        TextInput::make('tackles')->numeric()->minValue(0),
                        TextInput::make('blocks')->numeric()->minValue(0),
                        TextInput::make('interceptions')->numeric()->minValue(0),
                        TextInput::make('duels')->numeric()->minValue(0),
                        TextInput::make('duels_won')->label('Duels won')->numeric()->minValue(0),
                        TextInput::make('fouls_drawn')->label('Fouls drawn')->numeric()->minValue(0),
                        TextInput::make('fouls_committed')->label('Fouls committed')->numeric()->minValue(0),
                    ]),

                Section::make('Discipline and penalties')
                    ->columns(4)
                    ->schema([
                        TextInput::make('yellow_cards')->label('Yellow cards')->numeric()->minValue(0),
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
                ->with(['fixture.awayTeam', 'fixture.homeTeam'])
                ->latest())
            ->columns([
                TextColumn::make('fixture_id')
                    ->state(fn (PlayerFixtureStat $record): string => self::statFixtureLabel($record))
                    ->label('Fixture')
                    ->limit(30),
                TextColumn::make('game_minutes')->label('Min')->sortable(),
                TextColumn::make('position')->searchable()->limit(12),
                TextColumn::make('rating')->numeric(decimalPlaces: 1)->sortable(),
                TextColumn::make('goals')->sortable(),
                TextColumn::make('assists')->sortable(),
                TextColumn::make('saves')->sortable(),
                TextColumn::make('yellow_cards')->label('YC')->sortable(),
                TextColumn::make('red_cards')->label('RC')->sortable(),
            ])
            ->filters([
                SelectFilter::make('fixture_id')
                    ->label('Fixture')
                    ->relationship('fixture', 'id')
                    ->getOptionLabelFromRecordUsing(fn (Fixture $record): string => self::fixtureLabel($record))
                    ->searchable()
                    ->preload(),

                SelectFilter::make('position')
                    ->options(fn (): array => $this->getOwnerRecord()
                        ->playerFixtureStats()
                        ->whereNotNull('position')
                        ->distinct()
                        ->orderBy('position')
                        ->pluck('position', 'position')
                        ->all())
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
                            unset($data['fixture_id']);
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

    private static function statFixtureLabel(PlayerFixtureStat $stat): string
    {
        if (! $stat->fixture) {
            return "Fixture #{$stat->fixture_id}";
        }

        return self::fixtureLabel($stat->fixture);
    }

    private static function fixtureLabel(Fixture $fixture): string
    {
        $fixture->loadMissing(['awayTeam', 'homeTeam']);

        $homeTeam = $fixture->homeTeam?->name ?? 'Home team';
        $awayTeam = $fixture->awayTeam?->name ?? 'Away team';

        return "{$homeTeam} vs {$awayTeam}";
    }
}
