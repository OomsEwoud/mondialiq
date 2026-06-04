<?php

namespace App\Filament\Resources\FixturePlayers;

use App\Filament\Resources\FixturePlayers\Pages\CreateFixturePlayer;
use App\Filament\Resources\FixturePlayers\Pages\EditFixturePlayer;
use App\Filament\Resources\FixturePlayers\Pages\ListFixturePlayers;
use App\Filament\Resources\FixturePlayers\Schemas\FixturePlayerForm;
use App\Filament\Resources\FixturePlayers\Tables\FixturePlayersTable;
use App\Models\FixturePlayer;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class FixturePlayerResource extends Resource
{
    protected static ?string $model = FixturePlayer::class;

    protected static bool $shouldRegisterNavigation = false;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedClipboardDocumentList;

    protected static string | UnitEnum | null $navigationGroup = 'Match Data';

    protected static ?string $navigationLabel = 'Lineups';

    protected static ?string $modelLabel = 'fixture player';

    protected static ?string $pluralModelLabel = 'fixture players';

    protected static ?int $navigationSort = 25;

    protected static ?string $recordTitleAttribute = 'position';

    public static function form(Schema $schema): Schema
    {
        return FixturePlayerForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FixturePlayersTable::configure($table);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['fixture.awayTeam', 'fixture.homeTeam', 'player', 'team']);
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
            'index' => ListFixturePlayers::route('/'),
            'create' => CreateFixturePlayer::route('/create'),
            'edit' => EditFixturePlayer::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return static::userCanManageFixturePlayers();
    }

    public static function canView(Model $record): bool
    {
        return static::userCanManageFixturePlayers();
    }

    public static function canEdit(Model $record): bool
    {
        return static::userCanManageFixturePlayers();
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

    public static function userCanManageFixturePlayers(): bool
    {
        return Auth::user()?->hasAnyRole(['admin', 'super_admin']) ?? false;
    }

    public static function userIsSuperAdmin(): bool
    {
        return Auth::user()?->hasRole('super_admin') ?? false;
    }
}
