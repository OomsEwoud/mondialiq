<?php

namespace App\Filament\Widgets;

use App\Enums\PredictionTypes;
use App\Filament\Resources\Fixtures\FixtureResource;
use App\Filament\Resources\Users\UserResource;
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
    protected ?string $heading = 'MondialiQ overview';

    protected ?string $description = 'Key metrics for users, fixtures and predictions.';

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
            Stat::make('Users', $this->formatCount(User::query()->count()))
                ->description('Total accounts')
                ->icon(Heroicon::Users)
                ->color('primary')
                ->url(UserResource::getUrl('index')),

            Stat::make('Fixtures', $this->formatCount(Fixture::query()->count()))
                ->description('All imported fixtures')
                ->icon(Heroicon::CalendarDays)
                ->color('gray')
                ->url(FixtureResource::getUrl('index')),

            Stat::make('Live fixtures', $this->formatCount(Fixture::query()->inProgress()->count()))
                ->description('Currently in progress')
                ->icon(Heroicon::Signal)
                ->color('success')
                ->url(FixtureResource::getUrl('index')),

            Stat::make('Upcoming fixtures', $this->formatCount(Fixture::query()->upcomingNotStarted()->count()))
                ->description('Fixtures still to be played')
                ->icon(Heroicon::Clock)
                ->color('warning')
                ->url(FixtureResource::getUrl('index')),

            Stat::make('Finished fixtures', $this->formatCount(Fixture::query()->finished()->count()))
                ->description('Fixtures with a final status')
                ->icon(Heroicon::CheckCircle)
                ->color('success')
                ->url(FixtureResource::getUrl('index')),

            Stat::make('User predictions', $this->formatCount($this->userPredictions()->count()))
                ->description('Predictions submitted by users')
                ->icon(Heroicon::PencilSquare)
                ->color('info')
                ->url(FixtureResource::getUrl('index')),

            Stat::make('Unvalidated predictions', $this->formatCount($this->userPredictions()->whereNull('points_awarded_at')->count()))
                ->description('Predictions still waiting for points')
                ->icon(Heroicon::ExclamationTriangle)
                ->color('danger')
                ->url(FixtureResource::getUrl('index')),

            Stat::make('AI predictions', $this->formatCount(Prediction::query()->where('source', PredictionTypes::Ai->value)->count()))
                ->description('Generated AI analyses')
                ->icon(Heroicon::CpuChip)
                ->color('primary')
                ->url(FixtureResource::getUrl('index')),
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
