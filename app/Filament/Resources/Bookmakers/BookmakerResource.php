<?php

namespace App\Filament\Resources\Bookmakers;

use App\Filament\Resources\Bookmakers\Pages\CreateBookmaker;
use App\Filament\Resources\Bookmakers\Pages\EditBookmaker;
use App\Filament\Resources\Bookmakers\Pages\ListBookmakers;
use App\Filament\Resources\Bookmakers\Schemas\BookmakerForm;
use App\Filament\Resources\Bookmakers\Tables\BookmakersTable;
use App\Models\Bookmaker;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class BookmakerResource extends Resource
{
    protected static ?string $model = Bookmaker::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBuildingStorefront;

    protected static string|UnitEnum|null $navigationGroup = 'Reference Data';

    protected static ?string $navigationLabel = 'Bookmakers';

    protected static ?int $navigationSort = 10;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return BookmakerForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return BookmakersTable::configure($table);
    }

    public static function getPageSubheading(): string
    {
        return 'Manage bookmaker reference data used for fixture odds.';
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withCount('fixtureOdds');
    }

    public static function getPages(): array
    {
        return [
            'index' => ListBookmakers::route('/'),
            'create' => CreateBookmaker::route('/create'),
            'edit' => EditBookmaker::route('/{record}/edit'),
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
