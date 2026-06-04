<?php

namespace App\Filament\Resources\MissingPlayers;

use App\Filament\Resources\MissingPlayers\Pages\CreateMissingPlayer;
use App\Filament\Resources\MissingPlayers\Pages\EditMissingPlayer;
use App\Filament\Resources\MissingPlayers\Pages\ListMissingPlayers;
use App\Filament\Resources\MissingPlayers\Schemas\MissingPlayerForm;
use App\Filament\Resources\MissingPlayers\Tables\MissingPlayersTable;
use App\Models\MissingPlayer;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class MissingPlayerResource extends Resource
{
    protected static ?string $model = MissingPlayer::class;

    protected static bool $shouldRegisterNavigation = false;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedUserMinus;

    protected static string | UnitEnum | null $navigationGroup = 'Match Data';

    protected static ?string $navigationLabel = 'Missing Players';

    protected static ?int $navigationSort = 30;

    protected static ?string $recordTitleAttribute = 'type';

    public static function form(Schema $schema): Schema
    {
        return MissingPlayerForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return MissingPlayersTable::configure($table);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['fixture.awayTeam', 'fixture.homeTeam', 'player']);
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
            'index' => ListMissingPlayers::route('/'),
            'create' => CreateMissingPlayer::route('/create'),
            'edit' => EditMissingPlayer::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return static::userCanManageMissingPlayers();
    }

    public static function canView(Model $record): bool
    {
        return static::userCanManageMissingPlayers();
    }

    public static function canEdit(Model $record): bool
    {
        return static::userCanManageMissingPlayers();
    }

    public static function canCreate(): bool
    {
        return static::userCanManageMissingPlayers();
    }

    public static function canDelete(Model $record): bool
    {
        return static::userIsSuperAdmin();
    }

    public static function canDeleteAny(): bool
    {
        return static::userIsSuperAdmin();
    }

    public static function userCanManageMissingPlayers(): bool
    {
        return Auth::user()?->hasAnyRole(['admin', 'super_admin']) ?? false;
    }

    public static function userIsSuperAdmin(): bool
    {
        return Auth::user()?->hasRole('super_admin') ?? false;
    }
}
