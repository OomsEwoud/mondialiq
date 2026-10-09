import { useState } from 'react';
import BackButton from '@/components/navigation/back-button';
import PlayerAttackingSection from '@/components/players/player-attacking-section';
import PlayerDefensiveSection from '@/components/players/player-defensive-section';
import PlayerDisciplineSection from '@/components/players/player-discipline-section';
import PlayerGoalkeeperSection from '@/components/players/player-goalkeeper-section';
import PlayerHero from '@/components/players/player-hero';
import PlayerInsight from '@/components/players/player-insight';
import PlayerPassingSection from '@/components/players/player-passing-section';
import PlayerPerformanceContext from '@/components/players/player-performance-context';
import PlayerSeasonEmptyState from '@/components/players/player-season-empty-state';
import PlayerSeasonOverview from '@/components/players/player-season-overview';
import PageHead from '@/components/seo/page-head';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/forms/select';
import type { PlayerDetails as PlayerDetailsType } from '@/types/player-details';
import {
    isGoalkeeper,
    shouldShowAttacking,
    shouldShowDefensive,
    shouldShowDiscipline,
    shouldShowGoalkeeping,
    shouldShowPassing,
} from '@/utils/player-stats';

export default function PlayerDetails({
    player,
}: {
    player: PlayerDetailsType;
}) {
    const seasons = [...player.seasonStats].sort(
        (a, b) =>
            b.season - a.season ||
            (a.league?.name ?? '').localeCompare(b.league?.name ?? ''),
    );
    const [selectedId, setSelectedId] = useState<string>('');
    const stat =
        seasons.find((item) => String(item.id) === selectedId) ?? seasons[0];

    return (
        <>
            <PageHead
                title={player.name}
                description={`Bekijk het spelersprofiel, de seizoensstatistieken en prestaties van ${player.name} op MondialIQ.`}
            />
            <div className="flex w-full flex-col gap-8">
                <BackButton className="w-fit" />
                <PlayerHero player={player} />
                {stat ? (
                    <section className="flex flex-col gap-6">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div>
                                <h2 className="mq-section-title">
                                    Seizoensoverzicht
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {stat.league?.name ?? 'Competitie onbekend'}{' '}
                                    · {stat.season}
                                </p>
                            </div>
                            {seasons.length > 1 && (
                                <div className="w-full sm:w-72">
                                    <label
                                        id="season-label"
                                        className="mb-2 block text-xs text-muted-foreground"
                                    >
                                        Competitie en seizoen
                                    </label>
                                    <Select
                                        value={String(stat.id)}
                                        onValueChange={setSelectedId}
                                    >
                                        <SelectTrigger
                                            aria-labelledby="season-label"
                                            className="w-full"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {seasons.map((item) => (
                                                <SelectItem
                                                    key={item.id}
                                                    value={String(item.id)}
                                                >
                                                    {item.league?.name ??
                                                        'Competitie onbekend'}{' '}
                                                    · {item.season}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <PlayerSeasonOverview
                            stats={stat}
                            isGoalkeeper={isGoalkeeper(
                                stat.position ?? player.position,
                            )}
                        />
                        <PlayerPerformanceContext stats={stat} />
                        <PlayerInsight stats={stat} />
                        <div className="border-t border-border-subtle pt-8">
                            <h2 className="mq-section-title mb-6">
                                Statistieken
                            </h2>
                            <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
                                {shouldShowAttacking(stat) && (
                                    <PlayerAttackingSection stats={stat} />
                                )}
                                {shouldShowPassing(stat) && (
                                    <PlayerPassingSection stats={stat} />
                                )}
                                {shouldShowDefensive(stat) && (
                                    <PlayerDefensiveSection stats={stat} />
                                )}
                                {shouldShowDiscipline(stat) && (
                                    <PlayerDisciplineSection stats={stat} />
                                )}
                                {shouldShowGoalkeeping(
                                    stat,
                                    stat.position ?? player.position,
                                ) && <PlayerGoalkeeperSection stats={stat} />}
                            </div>
                        </div>
                    </section>
                ) : (
                    <PlayerSeasonEmptyState />
                )}
            </div>
        </>
    );
}
