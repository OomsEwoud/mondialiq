<?php

namespace App\Filament\Resources\Standings;

use App\Filament\Resources\Standings\Pages\CreateStanding;
use App\Filament\Resources\Standings\Pages\EditStanding;
use App\Filament\Resources\Standings\Pages\ListStandings;
use App\Filament\Resources\Standings\Schemas\StandingForm;
use App\Filament\Resources\Standings\Tables\StandingsTable;
use App\Models\Standing;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class StandingResource extends Resource
{
    protected static ?string $model = Standing::class;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedTableCells;

    protected static string | UnitEnum | null $navigationGroup = 'Statistics';

    protected static ?string $navigationLabel = 'Standings';

    protected static ?int $navigationSort = 20;

    protected static ?string $recordTitleAttribute = 'group_name';

    public static function form(Schema $schema): Schema
    {
        return StandingForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return StandingsTable::configure($table);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['league', 'team'])
            ->orderBy('group_name')
            ->orderBy('rank');
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
            'index' => ListStandings::route('/'),
            'create' => CreateStanding::route('/create'),
            'edit' => EditStanding::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return static::userCanManageStandings();
    }

    public static function canView(Model $record): bool
    {
        return static::userCanManageStandings();
    }

    public static function canEdit(Model $record): bool
    {
        return static::userCanManageStandings();
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

    public static function userCanManageStandings(): bool
    {
        return Auth::user()?->hasAnyRole(['admin', 'super_admin']) ?? false;
    }

    public static function userIsSuperAdmin(): bool
    {
        return Auth::user()?->hasRole('super_admin') ?? false;
    }
}
