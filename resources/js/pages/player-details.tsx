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

interface Props {
    player: PlayerDetailsType;
}

export default function PlayerDetails({ player }: Props) {
    const hasSeasonStats = player.seasonStats.length > 0;

    return (
        <>
            <PageHead
                title={player.name}
                description={`Explore ${player.name} player profile, season statistics and performance data on MondialIQ.`}
            />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:gap-6 lg:py-8">
                <BackButton className="w-fit rounded-2xl border border-slate-200 bg-white/95 text-slate-700 shadow-lg shadow-sm hover:border-cyan-200 hover:bg-cyan-50/60 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300" />
                <PlayerHero player={player} />

                {hasSeasonStats ? (
                    <div className="flex flex-col gap-5">
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
                                <div
                                    key={stat.id}
                                    className="flex flex-col gap-5"
                                >
                                    <div className="flex items-center gap-3">
                                        {stat.league?.logo ? (
                                            <img
                                                src={stat.league.logo}
                                                alt={stat.league.name}
                                                className="size-8 rounded-lg object-contain"
                                            />
                                        ) : null}
                                        <div>
                                            <h2 className="text-base font-bold text-slate-900">
                                                {stat.league?.name ?? 'Season'}
                                            </h2>
                                            <p className="text-xs font-semibold text-slate-500">
                                                {stat.season} season
                                                {stat.position
                                                    ? ` · ${stat.position}`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <PlayerSeasonOverview
                                        stats={stat}
                                        isGoalkeeper={isGk}
                                    />

                                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
                                </div>
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
