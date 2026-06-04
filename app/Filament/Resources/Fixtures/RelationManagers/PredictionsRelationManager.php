<?php

namespace App\Filament\Resources\Fixtures\RelationManagers;

use App\Enums\PredictionTypes;
use App\Filament\Resources\Fixtures\FixtureResource;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class PredictionsRelationManager extends RelationManager
{
    protected static string $relationship = 'predictions';

    protected static ?string $modelLabel = 'prediction';

    protected static ?string $pluralModelLabel = 'predictions';

    public static function canViewForRecord(Model $ownerRecord, string $pageClass): bool
    {
        return FixtureResource::userCanManageFixtures();
    }

    protected function canCreate(): bool
    {
        return FixtureResource::userIsSuperAdmin();
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
                Section::make('Prediction identity')
                    ->columns(3)
                    ->schema([
                        Select::make('source')
                            ->options(self::sourceOptions())
                            ->required()
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        Select::make('user_id')
                            ->label('User')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        Select::make('winner_id')
                            ->label('Winner')
                            ->relationship('winner', 'name')
                            ->searchable()
                            ->preload()
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),
                    ]),

                Section::make('Prediction result')
                    ->columns(3)
                    ->schema([
                        TextInput::make('home_goals')
                            ->label('Home goals')
                            ->numeric()
                            ->minValue(0)
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        TextInput::make('away_goals')
                            ->label('Away goals')
                            ->numeric()
                            ->minValue(0)
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        TextInput::make('total_goals')
                            ->label('Total goals')
                            ->numeric()
                            ->minValue(0)
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        Textarea::make('advice')
                            ->columnSpanFull()
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),
                    ]),

                Section::make('Chances and confidence')
                    ->columns(4)
                    ->schema([
                        TextInput::make('confidence')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        TextInput::make('home_chance')
                            ->label('Home chance')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        TextInput::make('draw_chance')
                            ->label('Draw chance')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        TextInput::make('away_chance')
                            ->label('Away chance')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),
                    ]),

                Section::make('Scoring')
                    ->columns(2)
                    ->schema([
                        TextInput::make('points')
                            ->numeric()
                            ->minValue(0)
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),

                        DateTimePicker::make('points_awarded_at')
                            ->label('Points awarded at')
                            ->seconds(false)
                            ->disabled(fn (): bool => ! FixtureResource::userIsSuperAdmin()),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query
                ->with(['user', 'winner'])
                ->latest())
            ->columns([
                TextColumn::make('source')
                    ->badge()
                    ->formatStateUsing(fn (PredictionTypes | string | null $state): string => self::sourceLabel($state))
                    ->color(fn (PredictionTypes | string | null $state): string => self::sourceColor($state)),

                TextColumn::make('user.name')
                    ->label('User')
                    ->placeholder('-')
                    ->limit(18),

                TextColumn::make('winner.name')
                    ->label('Winner')
                    ->placeholder('-')
                    ->limit(18),

                TextColumn::make('score')
                    ->state(fn (Model $record): string => self::predictedScore($record))
                    ->label('Score'),

                TextColumn::make('confidence')
                    ->placeholder('-')
                    ->limit(12),

                TextColumn::make('points')
                    ->sortable(),

                TextColumn::make('points_awarded_at')
                    ->label('Scored at')
                    ->dateTime('d M H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('source')
                    ->options(self::sourceOptions()),

                TernaryFilter::make('points_awarded_at')
                    ->label('Scoring')
                    ->placeholder('All')
                    ->trueLabel('Scored')
                    ->falseLabel('Unscored')
                    ->queries(
                        true: fn (Builder $query): Builder => $query->whereNotNull('points_awarded_at'),
                        false: fn (Builder $query): Builder => $query->whereNull('points_awarded_at'),
                    ),
            ])
            ->headerActions([
                CreateAction::make()
                    ->visible(fn (): bool => FixtureResource::userIsSuperAdmin()),
            ])
            ->recordActions([
                EditAction::make()
                    ->visible(fn () => Auth::user()?->hasAnyRole(['admin', 'super_admin']))
                    ->using(function (Model $record, array $data): Model {
                        if (! FixtureResource::userIsSuperAdmin()) {
                            unset(
                                $data['user_id'],
                                $data['winner_id'],
                                $data['source'],
                                $data['total_goals'],
                                $data['home_goals'],
                                $data['away_goals'],
                                $data['confidence'],
                                $data['advice'],
                                $data['home_chance'],
                                $data['draw_chance'],
                                $data['away_chance'],
                                $data['points'],
                                $data['points_awarded_at'],
                            );
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

    private static function predictedScore(Model $prediction): string
    {
        if ($prediction->home_goals === null || $prediction->away_goals === null) {
            return '-';
        }

        return "{$prediction->home_goals} - {$prediction->away_goals}";
    }

    private static function sourceOptions(): array
    {
        return collect(PredictionTypes::cases())
            ->mapWithKeys(fn (PredictionTypes $type): array => [$type->value => $type->label()])
            ->all();
    }

    private static function sourceLabel(PredictionTypes | string | null $source): string
    {
        if ($source instanceof PredictionTypes) {
            return $source->label();
        }

        return PredictionTypes::tryFrom((string) $source)?->label() ?? '-';
    }

    private static function sourceColor(PredictionTypes | string | null $source): string
    {
        $value = $source instanceof PredictionTypes ? $source : PredictionTypes::tryFrom((string) $source);

        return match ($value) {
            PredictionTypes::User => 'info',
            PredictionTypes::Ai => 'primary',
            PredictionTypes::Api => 'gray',
            default => 'gray',
        };
    }
}
