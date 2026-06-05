<?php

namespace App\Filament\Resources\FeedbackMessages\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\FeedbackMessages\FeedbackMessageResource;
use Filament\Resources\Pages\ListRecords;

class ListFeedbackMessages extends ListRecords
{
    use HasResourcePageSubheading;

    protected static string $resource = FeedbackMessageResource::class;
}
