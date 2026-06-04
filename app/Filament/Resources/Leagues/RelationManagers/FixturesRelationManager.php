<?php

namespace App\Filament\Resources\Leagues\RelationManagers;

use App\Filament\Resources\Fixtures\FixtureResource;
use App\Filament\Resources\Leagues\LeagueResource;
use App\Models\Fixture;
use Filament\Actions\EditAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class FixturesRelationManager extends RelationManager
{
    protected static string $relationship = 'fixtures';

    protected static ?string $modelLabel = 'fixture';

    protected static ?string $pluralModelLabel = 'fixtures';

    public static function canViewForRecord(Model $ownerRecord, string $pageClass): bool
    {
        return LeagueResource::userCanManageLeagues();
    }

    protected function canCreate(): bool
    {
        return false;
    }

    protected function canEdit(Model $record): bool
    {
        return LeagueResource::userCanManageLeagues();
    }

    public function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query
                ->with(['awayTeam', 'homeTeam'])
                ->orderBy('match_date'))
            ->columns([
                TextColumn::make('match')
                    ->state(fn (Fixture $record): string => self::fixtureLabel($record))
                    ->label('Fixture')
                    ->limit(32),

                TextColumn::make('match_date')
                    ->label('Kickoff')
                    ->dateTime('d M Y H:i')
                    ->sortable(),

                TextColumn::make('status_short')
                    ->label('Status')
                    ->badge()
                    ->color(fn (?string $state): string => self::statusColor($state)),

                TextColumn::make('elapsed_time')
                    ->label('Min')
                    ->formatStateUsing(fn (?int $state): string => $state === null ? '-' : "{$state}'"),

                TextColumn::make('score')
                    ->state(fn (Fixture $record): string => self::score($record))
                    ->label('Score'),

                TextColumn::make('round_name')
                    ->label('Round')
                    ->limit(24),
            ])
            ->recordActions([
                EditAction::make()
                    ->url(fn (Fixture $record): string => FixtureResource::getUrl('edit', ['record' => $record])),
            ]);
    }

    private static function fixtureLabel(Fixture $fixture): string
    {
        $homeTeam = $fixture->homeTeam?->name ?? 'Home team';
        $awayTeam = $fixture->awayTeam?->name ?? 'Away team';

        return "{$homeTeam} vs {$awayTeam}";
    }

    private static function score(Fixture $fixture): string
    {
        if ($fixture->fulltime_home_goals === null || $fixture->fulltime_away_goals === null) {
            return '-';
        }

        return "{$fixture->fulltime_home_goals} - {$fixture->fulltime_away_goals}";
    }

    private static function statusColor(?string $status): string
    {
        return match (true) {
            in_array($status, Fixture::LIVE_STATUS_SHORTS, true) => 'success',
            in_array($status, Fixture::FINISHED_STATUS_SHORTS, true) => 'gray',
            in_array($status, ['CANC', 'PST', 'ABD', 'AWD', 'WO', 'SUSP', 'INT'], true) => 'warning',
            $status === Fixture::NOT_STARTED_STATUS_SHORT => 'info',
            default => 'info',
        };
    }
}
