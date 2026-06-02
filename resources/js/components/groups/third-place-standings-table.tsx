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
                                    'rounded-2xl border p-3 shadow-sm',
                                    qualified
                                        ? 'border-emerald-200 bg-emerald-50/40'
                                        : 'border-slate-200 bg-slate-50',
                                )}
                            >
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-slate-700">
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

                                <div className="grid grid-cols-6 overflow-hidden rounded-xl border border-slate-200 bg-white text-center text-sm">
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
                                            className="border-r border-slate-100 py-2 last:border-r-0"
                                        >
                                            <p className="text-[10px] font-bold text-slate-400">
                                                {label}
                                            </p>
                                            <p className="font-black text-slate-900">
                                                {value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </article>

                            {team.rank === QUALIFICATION_CUTOFF_RANK && (
                                <div className="my-2 flex items-center gap-3 px-1 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                    <span className="h-px flex-1 bg-amber-200" />
                                    <span>Qualification cutoff</span>
                                    <span className="h-px flex-1 bg-amber-200" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                <table className="w-full min-w-[820px] border-collapse text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-600 uppercase">
                        <tr>
                            <th className="w-16 px-4 py-4 text-left">#</th>
                            <th className="px-4 py-4 text-left">Team</th>
                            {stats.map((stat) => (
                                <th
                                    key={stat.key}
                                    className="w-20 px-4 py-4 text-center"
                                >
                                    {stat.label}
                                </th>
                            ))}
                            <th className="w-24 px-4 py-4 text-center">GD</th>
                            <th className="w-24 px-4 py-4 text-center">Pts</th>
                            <th className="w-36 px-4 py-4 text-right">
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
                                            'border-t border-slate-100 text-slate-900 transition-colors hover:bg-slate-50',
                                            qualified
                                                ? 'border-l-4 border-l-emerald-300 bg-emerald-50/40'
                                                : 'bg-slate-50/60',
                                        )}
                                    >
                                        <td className="px-4 py-4">
                                            <span className="inline-flex size-8 items-center justify-center rounded-full bg-white font-bold text-slate-700">
                                                {team.rank}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
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
