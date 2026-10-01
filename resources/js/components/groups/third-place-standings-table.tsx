import { Fragment } from 'react';

import PointsBadge from '@/components/groups/points-badge';
import QualificationBadge from '@/components/groups/qualification-badge';
import QualificationCutoffRow from '@/components/groups/qualification-cutoff-row';
import TeamStandingLink from '@/components/groups/team-standing-link';
import { stats } from '@/const/standing';
import { cn } from '@/lib/utils';
import type { GroupTeam } from '@/types/group';
import { formatGoalDifference } from '@/utils/standings';

interface Props {
    teams: GroupTeam[];
}

const QUALIFICATION_CUTOFF_RANK = 8;

export default function ThirdPlaceStandingsTable({ teams }: Props) {
    return (
        <>
            <div className="grid gap-3 md:hidden">
                {teams.map((team) => {
                    const qualified = team.rank <= QUALIFICATION_CUTOFF_RANK;

                    return (
                        <div key={team.id}>
                            <article
                                className={cn(
                                    'rounded-lg border p-4 shadow-sm',
                                    qualified
                                        ? 'border-emerald-200 bg-emerald-50/30'
                                        : 'border-border bg-card',
                                )}
                            >
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-card text-sm font-semibold text-muted-foreground shadow-sm ring-1 ring-border">
                                            {team.rank}
                                        </span>
                                        <div className="min-w-0">
                                            <TeamStandingLink
                                                id={team.id}
                                                code={team.code}
                                                logo={team.logo}
                                                name={team.name}
                                            />
                                            <div className="mt-1 ml-1.5">
                                                <QualificationBadge
                                                    qualified={qualified}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <PointsBadge points={team.points} />
                                </div>

                                <div className="grid grid-cols-6 overflow-hidden rounded-lg border border-border bg-card text-center text-sm">
                                    {[
                                        ...stats.map((stat) => [
                                            stat.label,
                                            team[stat.key],
                                        ]),
                                        [
                                            'GD',
                                            formatGoalDifference(
                                                team.goalDifference,
                                            ),
                                        ],
                                        ['Pts', team.points],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="border-r border-border py-2.5 last:border-r-0"
                                        >
                                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                {label}
                                            </p>
                                            <p className="font-bold text-foreground">
                                                {value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </article>

                            {team.rank === QUALIFICATION_CUTOFF_RANK && (
                                <div className="my-3 flex items-center gap-3 px-1 text-xs font-semibold tracking-wide text-amber-600 uppercase">
                                    <span className="h-px flex-1 bg-amber-200" />
                                    <span>Qualification cutoff</span>
                                    <span className="h-px flex-1 bg-amber-200" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-sm md:block">
                <table className="w-full min-w-[820px] border-collapse text-sm">
                    <thead className="bg-gradient-to-b from-card to-card text-xs text-muted-foreground uppercase">
                        <tr>
                            <th className="w-16 px-5 py-4 text-left font-bold tracking-wide">
                                #
                            </th>
                            <th className="px-5 py-4 text-left font-bold tracking-wide">
                                Team
                            </th>
                            {stats.map((stat) => (
                                <th
                                    key={stat.key}
                                    className="w-20 px-4 py-4 text-center font-bold tracking-wide"
                                >
                                    {stat.label}
                                </th>
                            ))}
                            <th className="w-24 px-4 py-4 text-center font-bold tracking-wide">
                                GD
                            </th>
                            <th className="w-24 px-4 py-4 text-center font-bold tracking-wide">
                                Pts
                            </th>
                            <th className="w-36 px-4 py-4 text-right font-bold tracking-wide">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team) => {
                            const qualified =
                                team.rank <= QUALIFICATION_CUTOFF_RANK;

                            return (
                                <Fragment key={team.id}>
                                    <tr
                                        className={cn(
                                            'border-t border-border text-foreground transition-colors hover:bg-muted/80',
                                            qualified
                                                ? 'border-l-4 border-l-emerald-300 bg-emerald-50/30'
                                                : 'bg-muted/60',
                                        )}
                                    >
                                        <td className="px-5 py-4">
                                            <span className="inline-flex size-8 items-center justify-center rounded-full bg-card font-bold text-foreground shadow-sm ring-1 ring-border">
                                                {team.rank}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <TeamStandingLink
                                                id={team.id}
                                                code={team.code}
                                                logo={team.logo}
                                                name={team.name}
                                            />
                                        </td>
                                        {stats.map((stat) => (
                                            <td
                                                key={stat.key}
                                                className="px-4 py-4 text-center font-bold"
                                            >
                                                {team[stat.key]}
                                            </td>
                                        ))}
                                        <td className="px-4 py-4 text-center font-bold">
                                            {formatGoalDifference(
                                                team.goalDifference,
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <PointsBadge points={team.points} />
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <QualificationBadge
                                                qualified={qualified}
                                            />
                                        </td>
                                    </tr>
                                    {team.rank ===
                                        QUALIFICATION_CUTOFF_RANK && (
                                        <QualificationCutoffRow colSpan={9} />
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}
