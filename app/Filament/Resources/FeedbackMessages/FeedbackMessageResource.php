<?php

namespace App\Filament\Resources\FeedbackMessages;

use App\Filament\Resources\FeedbackMessages\Pages\ListFeedbackMessages;
use App\Filament\Resources\FeedbackMessages\Pages\ViewFeedbackMessage;
use App\Filament\Resources\FeedbackMessages\Schemas\FeedbackMessageInfolist;
use App\Filament\Resources\FeedbackMessages\Tables\FeedbackMessagesTable;
use App\Models\FeedbackMessage;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class FeedbackMessageResource extends Resource
{
    protected static ?string $model = FeedbackMessage::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChatBubbleLeftRight;

    protected static string|UnitEnum|null $navigationGroup = 'Management';

    protected static ?string $navigationLabel = 'Feedback';

    protected static ?int $navigationSort = 15;

    protected static ?string $recordTitleAttribute = 'subject';

    public static function infolist(Schema $schema): Schema
    {
        return FeedbackMessageInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FeedbackMessagesTable::configure($table);
    }

    public static function getPageSubheading(): string
    {
        return 'Review contact and feedback messages submitted by logged-in MondialIQ users.';
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['handledBy', 'user']);
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
            'index' => ListFeedbackMessages::route('/'),
            'view' => ViewFeedbackMessage::route('/{record}'),
        ];
    }

    public static function canViewAny(): bool
    {
        return static::userCanReviewFeedback();
    }

    public static function canView(Model $record): bool
    {
        return static::userCanReviewFeedback();
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return static::userIsSuperAdmin();
    }

    public static function canDeleteAny(): bool
    {
        return static::userIsSuperAdmin();
    }

    public static function userCanReviewFeedback(): bool
    {
        return Auth::user()?->hasAnyRole(['admin', 'super_admin']) ?? false;
    }

    public static function userIsSuperAdmin(): bool
    {
        return Auth::user()?->hasRole('super_admin') ?? false;
    }
}
