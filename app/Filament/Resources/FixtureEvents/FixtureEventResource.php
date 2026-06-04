<?php

namespace App\Filament\Resources\FixtureEvents;

use App\Filament\Resources\FixtureEvents\Pages\CreateFixtureEvent;
use App\Filament\Resources\FixtureEvents\Pages\EditFixtureEvent;
use App\Filament\Resources\FixtureEvents\Pages\ListFixtureEvents;
use App\Filament\Resources\FixtureEvents\Schemas\FixtureEventForm;
use App\Filament\Resources\FixtureEvents\Tables\FixtureEventsTable;
use App\Models\FixtureEvent;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class FixtureEventResource extends Resource
{
    protected static ?string $model = FixtureEvent::class;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedBolt;

    protected static string | UnitEnum | null $navigationGroup = 'Match Data';

    protected static ?string $navigationLabel = 'Fixture Events';

    protected static ?int $navigationSort = 20;

    protected static ?string $recordTitleAttribute = 'detail';

    public static function form(Schema $schema): Schema
    {
        return FixtureEventForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FixtureEventsTable::configure($table);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['assist', 'fixture.awayTeam', 'fixture.homeTeam', 'player', 'team']);
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
            'index' => ListFixtureEvents::route('/'),
            'create' => CreateFixtureEvent::route('/create'),
            'edit' => EditFixtureEvent::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return static::userCanManageFixtureEvents();
    }

    public static function canView(Model $record): bool
    {
        return static::userCanManageFixtureEvents();
    }

    public static function canEdit(Model $record): bool
    {
        return static::userCanManageFixtureEvents();
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

    public static function userCanManageFixtureEvents(): bool
    {
        return Auth::user()?->hasAnyRole(['admin', 'super_admin']) ?? false;
    }

    public static function userIsSuperAdmin(): bool
    {
        return Auth::user()?->hasRole('super_admin') ?? false;
    }
}
