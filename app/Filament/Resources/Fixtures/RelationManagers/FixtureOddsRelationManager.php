<?php

namespace App\Filament\Resources\Fixtures\RelationManagers;

use App\Filament\Resources\Fixtures\FixtureResource;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DateTimePicker;
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

class FixtureOddsRelationManager extends RelationManager
{
    protected static string $relationship = 'fixtureOdds';

    protected static ?string $modelLabel = 'odd';

    protected static ?string $pluralModelLabel = 'odds';

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
                Section::make('Market')
                    ->description('Manually added odds supplement missing API data and can influence prediction output.')
                    ->columns(2)
                    ->schema([
                        Select::make('bookmaker_id')
                            ->label('Bookmaker')
                            ->relationship('bookmaker', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (string $operation): bool => $operation === 'edit' && ! FixtureResource::userIsSuperAdmin()),

                        Select::make('bet_type_id')
                            ->label('Bet type')
                            ->relationship('betType', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (string $operation): bool => $operation === 'edit' && ! FixtureResource::userIsSuperAdmin()),

                        TextInput::make('bookmaker_name')
                            ->label('Bookmaker name')
                            ->maxLength(255),

                        TextInput::make('bet_name')
                            ->label('Bet name')
                            ->maxLength(255),
                    ]),

                Section::make('Odds value')
                    ->columns(3)
                    ->schema([
                        TextInput::make('value')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('odd')
                            ->required()
                            ->numeric()
                            ->minValue(1),

                        DateTimePicker::make('api_updated_at')
                            ->label('API updated at')
                            ->seconds(false),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query
                ->with(['betType', 'bookmaker'])
                ->orderBy('bet_type_id')
                ->orderBy('bookmaker_name'))
            ->columns([
                TextColumn::make('bookmaker_name')
                    ->label('Bookmaker')
                    ->searchable()
                    ->limit(20),

                TextColumn::make('bet_name')
                    ->label('Bet')
                    ->searchable()
                    ->limit(20),

                TextColumn::make('value')
                    ->searchable()
                    ->limit(18),

                TextColumn::make('odd')
                    ->numeric(decimalPlaces: 2)
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('bookmaker_id')
                    ->label('Bookmaker')
                    ->relationship('bookmaker', 'name')
                    ->searchable()
                    ->preload(),

                SelectFilter::make('bet_type_id')
                    ->label('Bet type')
                    ->relationship('betType', 'name')
                    ->searchable()
                    ->preload(),
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
                            unset($data['bookmaker_id'], $data['bet_type_id'], $data['external_bookmaker_id'], $data['external_bet_id']);
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
