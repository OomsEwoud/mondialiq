import BackButton from '@/components/navigation/back-button';
import PlayerAttackingSection from '@/components/players/player-attacking-section';
import PlayerDefensiveSection from '@/components/players/player-defensive-section';
import PlayerDisciplineSection from '@/components/players/player-discipline-section';
import PlayerGoalkeeperSection from '@/components/players/player-goalkeeper-section';
import PlayerHero from '@/components/players/player-hero';
import PlayerPassingSection from '@/components/players/player-passing-section';
import PlayerSeasonEmptyState from '@/components/players/player-season-empty-state';
import PlayerSeasonOverview from '@/components/players/player-season-overview';
import PageHead from '@/components/seo/page-head';
import type { PlayerDetails as PlayerDetailsType } from '@/types/player-details';
import {
    isGoalkeeper,
    shouldShowAttacking,
    shouldShowDefensive,
    shouldShowDiscipline,
    shouldShowGoalkeeping,
    shouldShowPassing,
} from '@/utils/player-stats';
import { formatPositionLabel } from '@/utils/team-players';

interface Props {
    player: PlayerDetailsType;
}

export default function PlayerDetails({ player }: Props) {
    const hasSeasonStats = player.seasonStats.length > 0;

    return (
        <>
            <PageHead
                title={player.name}
                description={`Bekijk het spelersprofiel, de seizoensstatistieken en prestaties van ${player.name} op MondialIQ.`}
            />

            <div className="flex w-full flex-col gap-8">
                <BackButton className="w-fit" />
                <PlayerHero player={player} />

                {hasSeasonStats ? (
                    <div className="flex flex-col gap-10">
                        {player.seasonStats.map((stat) => {
                            const isGk = isGoalkeeper(
                                stat.position ?? player.position,
                            );
                            const showAttacking = shouldShowAttacking(stat);
                            const showPassing = shouldShowPassing(stat);
                            const showDefensive = shouldShowDefensive(stat);
                            const showDiscipline = shouldShowDiscipline(stat);
                            const showGoalkeeping = shouldShowGoalkeeping(
                                stat,
                                stat.position ?? player.position,
                            );

                            return (
                                <section
                                    key={stat.id}
                                    className="flex flex-col gap-5 border-t border-border-subtle pt-8"
                                >
                                    <div className="flex items-center gap-4">
                                        {stat.league?.logo ? (
                                            <span className="flex size-12 items-center justify-center rounded-md border border-border-strong bg-crest-surface p-2">
                                                <img
                                                    src={stat.league.logo}
                                                    alt={stat.league.name}
                                                    className="size-full object-contain"
                                                />
                                            </span>
                                        ) : null}
                                        <div>
                                            <p className="text-xs font-bold text-primary uppercase">
                                                Seizoensstatistieken
                                            </p>
                                            <h2 className="mt-0.5 text-2xl font-black text-foreground">
                                                {stat.league?.name ?? 'Seizoen'}
                                            </h2>
                                            <p className="text-xs font-semibold text-muted-foreground">
                                                Seizoen {stat.season}
                                                {stat.position
                                                    ? ` · ${formatPositionLabel(stat.position)}`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <PlayerSeasonOverview
                                        stats={stat}
                                        isGoalkeeper={isGk}
                                    />

                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        {showAttacking ? (
                                            <PlayerAttackingSection
                                                stats={stat}
                                            />
                                        ) : null}
                                        {showPassing ? (
                                            <PlayerPassingSection
                                                stats={stat}
                                            />
                                        ) : null}
                                        {showDefensive ? (
                                            <PlayerDefensiveSection
                                                stats={stat}
                                            />
                                        ) : null}
                                        {showDiscipline ? (
                                            <PlayerDisciplineSection
                                                stats={stat}
                                            />
                                        ) : null}
                                    </div>

                                    {showGoalkeeping ? (
                                        <PlayerGoalkeeperSection stats={stat} />
                                    ) : null}
                                </section>
                            );
                        })}
                    </div>
                ) : (
                    <PlayerSeasonEmptyState />
                )}
            </div>
        </>
    );
}
