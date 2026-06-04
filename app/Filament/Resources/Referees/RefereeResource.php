<?php

namespace App\Filament\Resources\Referees;

use App\Filament\Resources\Referees\Pages\CreateReferee;
use App\Filament\Resources\Referees\Pages\EditReferee;
use App\Filament\Resources\Referees\Pages\ListReferees;
use App\Filament\Resources\Referees\Schemas\RefereeForm;
use App\Filament\Resources\Referees\Tables\RefereesTable;
use App\Models\Referee;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class RefereeResource extends Resource
{
    protected static ?string $model = Referee::class;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedIdentification;

    protected static string | UnitEnum | null $navigationGroup = 'Reference Data';

    protected static ?string $navigationLabel = 'Referees';

    protected static ?int $navigationSort = 40;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return RefereeForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return RefereesTable::configure($table);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withCount('fixtures');
    }

    public static function getPages(): array
    {
        return [
            'index' => ListReferees::route('/'),
            'create' => CreateReferee::route('/create'),
            'edit' => EditReferee::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return static::userCanManageReferees();
    }

    public static function canView(Model $record): bool
    {
        return static::userCanManageReferees();
    }

    public static function canEdit(Model $record): bool
    {
        return static::userCanManageReferees();
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

    public static function userCanManageReferees(): bool
    {
        return Auth::user()?->hasAnyRole(['admin', 'super_admin']) ?? false;
    }

    public static function userIsSuperAdmin(): bool
    {
        return Auth::user()?->hasRole('super_admin') ?? false;
    }
}
