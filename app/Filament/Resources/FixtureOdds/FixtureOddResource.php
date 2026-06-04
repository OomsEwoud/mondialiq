<?php

namespace App\Filament\Resources\FixtureOdds;

use App\Filament\Resources\FixtureOdds\Pages\CreateFixtureOdd;
use App\Filament\Resources\FixtureOdds\Pages\EditFixtureOdd;
use App\Filament\Resources\FixtureOdds\Pages\ListFixtureOdds;
use App\Filament\Resources\FixtureOdds\Schemas\FixtureOddForm;
use App\Filament\Resources\FixtureOdds\Tables\FixtureOddsTable;
use App\Models\FixtureOdd;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class FixtureOddResource extends Resource
{
    protected static ?string $model = FixtureOdd::class;

    protected static bool $shouldRegisterNavigation = false;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedCurrencyDollar;

    protected static string | UnitEnum | null $navigationGroup = 'Predictions & Odds';

    protected static ?string $navigationLabel = 'Fixture Odds';

    protected static ?int $navigationSort = 20;

    protected static ?string $recordTitleAttribute = 'value';

    public static function form(Schema $schema): Schema
    {
        return FixtureOddForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FixtureOddsTable::configure($table);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['betType', 'bookmaker', 'fixture.awayTeam', 'fixture.homeTeam']);
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
            'index' => ListFixtureOdds::route('/'),
            'create' => CreateFixtureOdd::route('/create'),
            'edit' => EditFixtureOdd::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return static::userCanManageFixtureOdds();
    }

    public static function canView(Model $record): bool
    {
        return static::userCanManageFixtureOdds();
    }

    public static function canEdit(Model $record): bool
    {
        return static::userCanManageFixtureOdds();
    }

    public static function canCreate(): bool
    {
        return static::userCanManageFixtureOdds();
    }

    public static function canDelete(Model $record): bool
    {
        return static::userIsSuperAdmin();
    }

    public static function canDeleteAny(): bool
    {
        return static::userIsSuperAdmin();
    }

    public static function userCanManageFixtureOdds(): bool
    {
        return Auth::user()?->hasAnyRole(['admin', 'super_admin']) ?? false;
    }

    public static function userIsSuperAdmin(): bool
    {
        return Auth::user()?->hasRole('super_admin') ?? false;
    }
}
