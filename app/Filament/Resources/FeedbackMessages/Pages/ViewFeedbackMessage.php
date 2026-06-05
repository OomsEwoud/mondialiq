<?php

namespace App\Filament\Resources\FeedbackMessages\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\FeedbackMessages\FeedbackMessageResource;
use App\Models\FeedbackMessage;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\Auth;

class ViewFeedbackMessage extends ViewRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = FeedbackMessageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('mark_handled')
                ->label('Mark handled')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->visible(fn (): bool => ! $this->feedbackMessage()->isHandled())
                ->action(function (): void {
                    $user = Auth::user();

                    if ($user === null) {
                        return;
                    }

                    $this->feedbackMessage()->markAsHandled($user);
                }),

            Action::make('mark_open')
                ->label('Reopen')
                ->icon('heroicon-o-arrow-path')
                ->color('warning')
                ->visible(fn (): bool => $this->feedbackMessage()->isHandled())
                ->action(function (): void {
                    $this->feedbackMessage()->markAsOpen();
                }),

            DeleteAction::make()
                ->visible(fn (): bool => FeedbackMessageResource::userIsSuperAdmin()),
        ];
    }

    private function feedbackMessage(): FeedbackMessage
    {
        return $this->getRecord();
    }
}
