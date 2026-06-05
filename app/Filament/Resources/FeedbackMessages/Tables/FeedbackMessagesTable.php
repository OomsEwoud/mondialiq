<?php

namespace App\Filament\Resources\FeedbackMessages\Tables;

use App\Filament\Resources\FeedbackMessages\FeedbackMessageResource;
use App\Http\Requests\Feedback\StoreFeedbackRequest;
use App\Models\FeedbackMessage;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class FeedbackMessagesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('category')
                    ->badge()
                    ->color('info')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('subject')
                    ->searchable()
                    ->sortable()
                    ->limit(48),

                TextColumn::make('handled_at')
                    ->label('Status')
                    ->badge()
                    ->state(fn (FeedbackMessage $record): string => $record->isHandled()
                        ? 'Handled'
                        : 'Open')
                    ->color(fn (FeedbackMessage $record): string => $record->isHandled()
                        ? 'success'
                        : 'warning')
                    ->sortable(),

                TextColumn::make('user.name')
                    ->label('User')
                    ->placeholder('Deleted user')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('user.email')
                    ->label('Email')
                    ->searchable()
                    ->toggleable()
                    ->limit(32),

                TextColumn::make('related_url')
                    ->label('Related URL')
                    ->placeholder('-')
                    ->limit(36)
                    ->toggleable(),

                TextColumn::make('created_at')
                    ->label('Submitted')
                    ->dateTime('d M Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('category')
                    ->options(array_combine(
                        StoreFeedbackRequest::CATEGORIES,
                        StoreFeedbackRequest::CATEGORIES,
                    )),

                TernaryFilter::make('handled_at')
                    ->label('Review status')
                    ->placeholder('All')
                    ->trueLabel('Handled')
                    ->falseLabel('Open')
                    ->queries(
                        true: fn (Builder $query): Builder => $query->whereNotNull('handled_at'),
                        false: fn (Builder $query): Builder => $query->whereNull('handled_at'),
                    ),
            ])
            ->recordActions([
                Action::make('mark_handled')
                    ->label('Mark handled')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (FeedbackMessage $record): bool => ! $record->isHandled())
                    ->action(function (FeedbackMessage $record): void {
                        $user = Auth::user();

                        if ($user === null) {
                            return;
                        }

                        $record->markAsHandled($user);
                    }),

                Action::make('mark_open')
                    ->label('Reopen')
                    ->icon('heroicon-o-arrow-path')
                    ->color('warning')
                    ->visible(fn (FeedbackMessage $record): bool => $record->isHandled())
                    ->action(function (FeedbackMessage $record): void {
                        $record->markAsOpen();
                    }),

                ViewAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->visible(fn (): bool => FeedbackMessageResource::userIsSuperAdmin()),
                ]),
            ]);
    }
}
