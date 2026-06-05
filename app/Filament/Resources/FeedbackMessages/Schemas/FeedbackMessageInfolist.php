<?php

namespace App\Filament\Resources\FeedbackMessages\Schemas;

use App\Models\FeedbackMessage;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class FeedbackMessageInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Feedback')
                    ->columns(2)
                    ->schema([
                        TextEntry::make('category')
                            ->badge()
                            ->color('info'),

                        TextEntry::make('created_at')
                            ->label('Submitted')
                            ->dateTime('d M Y H:i'),

                        TextEntry::make('review_status')
                            ->label('Review status')
                            ->badge()
                            ->state(fn (FeedbackMessage $record): string => $record->isHandled()
                                ? 'Handled'
                                : 'Open')
                            ->color(fn (FeedbackMessage $record): string => $record->isHandled()
                                ? 'success'
                                : 'warning'),

                        TextEntry::make('subject')
                            ->columnSpanFull(),

                        TextEntry::make('message')
                            ->columnSpanFull()
                            ->prose(),

                        TextEntry::make('related_url')
                            ->label('Related page or URL')
                            ->placeholder('-')
                            ->url(fn (?string $state): ?string => $state)
                            ->openUrlInNewTab()
                            ->columnSpanFull(),
                    ]),

                Section::make('User')
                    ->columns(2)
                    ->schema([
                        TextEntry::make('user.name')
                            ->label('Name')
                            ->placeholder('Deleted user'),

                        TextEntry::make('user.email')
                            ->label('Email')
                            ->placeholder('-'),
                    ]),

                Section::make('Review')
                    ->columns(2)
                    ->schema([
                        TextEntry::make('handled_at')
                            ->label('Handled at')
                            ->dateTime('d M Y H:i')
                            ->placeholder('Not handled yet'),

                        TextEntry::make('handledBy.name')
                            ->label('Handled by')
                            ->placeholder('-'),
                    ]),
            ]);
    }
}
