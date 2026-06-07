<?php

namespace App\Filament\Resources\Coaches;

use App\Filament\Resources\Coaches\Pages\CreateCoach;
use App\Filament\Resources\Coaches\Pages\EditCoach;
use App\Filament\Resources\Coaches\Pages\ListCoaches;
use App\Filament\Resources\Coaches\Schemas\CoachForm;
use App\Filament\Resources\Coaches\Tables\CoachesTable;
use App\Models\Coach;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class CoachResource extends Resource
{
    protected static ?string $model = Coach::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUser;

    protected static string|UnitEnum|null $navigationGroup = 'Management';

    protected static ?string $navigationLabel = 'Unassigned Coaches';

    protected static ?string $modelLabel = 'coach';

    protected static ?string $pluralModelLabel = 'coaches';

    protected static ?int $navigationSort = 50;

    protected static ?string $recordTitleAttribute = 'display_name';

    public static function form(Schema $schema): Schema
    {
        return CoachForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CoachesTable::configure($table);
    }

    public static function getPageSubheading(): string
    {
        return 'Manage coaches that are not currently linked to a team. Team coaches are managed from the team detail page.';
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['country', 'team'])
            ->whereNull('team_id');
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
            'index' => ListCoaches::route('/'),
            'create' => CreateCoach::route('/create'),
            'edit' => EditCoach::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return static::userCanManageCoaches();
    }

    public static function canView(Model $record): bool
    {
        return static::userCanManageCoaches();
    }

    public static function canEdit(Model $record): bool
    {
        return static::userCanManageCoaches();
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

    public static function userCanManageCoaches(): bool
    {
        return Auth::user()?->hasAnyRole(['admin', 'super_admin']) ?? false;
    }

    public static function userIsSuperAdmin(): bool
    {
        return Auth::user()?->hasRole('super_admin') ?? false;
    }
}
