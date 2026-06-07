<?php

namespace App\Filament\Resources\Leagues;

use App\Filament\Resources\Leagues\Pages\CreateLeague;
use App\Filament\Resources\Leagues\Pages\EditLeague;
use App\Filament\Resources\Leagues\Pages\ListLeagues;
use App\Filament\Resources\Leagues\RelationManagers\FixturesRelationManager;
use App\Filament\Resources\Leagues\RelationManagers\StandingsRelationManager;
use App\Filament\Resources\Leagues\RelationManagers\TeamStatisticsRelationManager;
use App\Filament\Resources\Leagues\Schemas\LeagueForm;
use App\Filament\Resources\Leagues\Tables\LeaguesTable;
use App\Models\League;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class LeagueResource extends Resource
{
    protected static ?string $model = League::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedTrophy;

    protected static string|UnitEnum|null $navigationGroup = 'Competition Data';

    protected static ?string $navigationLabel = 'Competitions';

    protected static ?int $navigationSort = 10;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return LeagueForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return LeaguesTable::configure($table);
    }

    public static function getPageSubheading(): string
    {
        return 'Manage competition data and inspect linked fixtures, standings and team statistics.';
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with('country')
            ->withCount(['fixtures', 'standings', 'teamStatistics']);
    }

    public static function getRelations(): array
    {
        return [
            FixturesRelationManager::class,
            StandingsRelationManager::class,
            TeamStatisticsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListLeagues::route('/'),
            'create' => CreateLeague::route('/create'),
            'edit' => EditLeague::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return static::userCanManageLeagues();
    }

    public static function canView(Model $record): bool
    {
        return static::userCanManageLeagues();
    }

    public static function canEdit(Model $record): bool
    {
        return static::userCanManageLeagues();
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

    public static function userCanManageLeagues(): bool
    {
        return Auth::user()?->hasAnyRole(['admin', 'super_admin']) ?? false;
    }

    public static function userIsSuperAdmin(): bool
    {
        return Auth::user()?->hasRole('super_admin') ?? false;
    }
}
