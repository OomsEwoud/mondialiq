<?php

namespace App\Filament\Widgets;

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\Prediction;
use App\Models\User;
use Filament\Support\Icons\Heroicon;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Number;

class MondialiqStatsOverview extends StatsOverviewWidget
{
    protected ?string $heading = 'MondialiQ overzicht';

    protected ?string $description = 'Kerncijfers voor gebruikers, wedstrijden en voorspellingen.';

    protected int | array | null $columns = [
        'md' => 2,
        'xl' => 4,
    ];

    /**
     * @return array<Stat>
     */
    protected function getStats(): array
    {
        return [
            Stat::make('Gebruikers', $this->formatCount(User::query()->count()))
                ->description('Totaal aantal accounts')
                ->icon(Heroicon::Users)
                ->color('primary'),

            Stat::make('Wedstrijden', $this->formatCount(Fixture::query()->count()))
                ->description('Alle geimporteerde fixtures')
                ->icon(Heroicon::CalendarDays)
                ->color('gray'),

            Stat::make('Live wedstrijden', $this->formatCount(Fixture::query()->inProgress()->count()))
                ->description('Nu bezig volgens status')
                ->icon(Heroicon::Signal)
                ->color('success'),

            Stat::make('Aankomende wedstrijden', $this->formatCount(Fixture::query()->upcomingNotStarted()->count()))
                ->description('Nog te spelen fixtures')
                ->icon(Heroicon::Clock)
                ->color('warning'),

            Stat::make('Afgelopen wedstrijden', $this->formatCount(Fixture::query()->finished()->count()))
                ->description('Fixtures met eindstatus')
                ->icon(Heroicon::CheckCircle)
                ->color('success'),

            Stat::make('Gebruikersvoorspellingen', $this->formatCount($this->userPredictions()->count()))
                ->description('Inzendingen van spelers')
                ->icon(Heroicon::PencilSquare)
                ->color('info'),

            Stat::make('Onverwerkte voorspellingen', $this->formatCount($this->userPredictions()->whereNull('points_awarded_at')->count()))
                ->description('Nog te scoren inzendingen')
                ->icon(Heroicon::ExclamationTriangle)
                ->color('danger'),

            Stat::make('AI-voorspellingen', $this->formatCount(Prediction::query()->where('source', PredictionTypes::Ai->value)->count()))
                ->description('Gegenereerde AI analyses')
                ->icon(Heroicon::CpuChip)
                ->color('primary'),
        ];
    }

    private function userPredictions(): Builder
    {
        return Prediction::query()->where('source', PredictionTypes::User->value);
    }

    private function formatCount(int $count): string
    {
        return Number::format($count);
    }
}
