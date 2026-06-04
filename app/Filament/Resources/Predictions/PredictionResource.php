<?php

namespace App\Filament\Resources\Predictions;

use App\Filament\Resources\Predictions\Pages\CreatePrediction;
use App\Filament\Resources\Predictions\Pages\EditPrediction;
use App\Filament\Resources\Predictions\Pages\ListPredictions;
use App\Filament\Resources\Predictions\Schemas\PredictionForm;
use App\Filament\Resources\Predictions\Tables\PredictionsTable;
use App\Models\Prediction;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class PredictionResource extends Resource
{
    protected static ?string $model = Prediction::class;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedSparkles;

    protected static string | UnitEnum | null $navigationGroup = 'Predictions & Odds';

    protected static ?string $navigationLabel = 'Predictions';

    protected static ?int $navigationSort = 10;

    protected static ?string $recordTitleAttribute = 'source';

    public static function form(Schema $schema): Schema
    {
        return PredictionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PredictionsTable::configure($table);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['fixture.awayTeam', 'fixture.homeTeam', 'user', 'winner']);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPredictions::route('/'),
            'create' => CreatePrediction::route('/create'),
            'edit' => EditPrediction::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return static::userCanViewPredictions();
    }

    public static function canView(Model $record): bool
    {
        return static::userCanViewPredictions();
    }

    public static function canEdit(Model $record): bool
    {
        return static::userCanViewPredictions();
    }

    public static function canCreate(): bool
    {
        return static::userIsSuperAdmin();
    }

    public static function canDelete(Model $record): bool
    {
        return static::userIsSuperAdmin();
    }

    public static function canDeleteAny(): bool
    {
        return static::userIsSuperAdmin();
    }

    public static function userCanViewPredictions(): bool
    {
        return Auth::user()?->hasAnyRole(['admin', 'super_admin']) ?? false;
    }

    public static function userIsSuperAdmin(): bool
    {
        return Auth::user()?->hasRole('super_admin') ?? false;
    }
}
