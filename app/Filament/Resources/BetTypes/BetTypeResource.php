<?php

namespace App\Filament\Resources\BetTypes;

use App\Filament\Resources\BetTypes\Pages\CreateBetType;
use App\Filament\Resources\BetTypes\Pages\EditBetType;
use App\Filament\Resources\BetTypes\Pages\ListBetTypes;
use App\Filament\Resources\BetTypes\Schemas\BetTypeForm;
use App\Filament\Resources\BetTypes\Tables\BetTypesTable;
use App\Models\BetType;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class BetTypeResource extends Resource
{
    protected static ?string $model = BetType::class;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedTag;

    protected static string | UnitEnum | null $navigationGroup = 'Reference Data';

    protected static ?string $navigationLabel = 'Bet Types';

    protected static ?int $navigationSort = 20;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return BetTypeForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return BetTypesTable::configure($table);
    }

    public static function getPageSubheading(): string
    {
        return 'Manage betting market types used for fixture odds.';
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withCount('fixtureOdds');
    }

    public static function getPages(): array
    {
        return [
            'index' => ListBetTypes::route('/'),
            'create' => CreateBetType::route('/create'),
            'edit' => EditBetType::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return static::userCanViewReferenceData();
    }

    public static function canView(Model $record): bool
    {
        return static::userCanViewReferenceData();
    }

    public static function canEdit(Model $record): bool
    {
        return static::userIsSuperAdmin();
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

    public static function userCanViewReferenceData(): bool
    {
        return Auth::user()?->hasAnyRole(['admin', 'super_admin']) ?? false;
    }

    public static function userIsSuperAdmin(): bool
    {
        return Auth::user()?->hasRole('super_admin') ?? false;
    }
}
