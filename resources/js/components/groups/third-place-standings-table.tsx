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
                                    'rounded-[1.5rem] border p-4 shadow-lg shadow-cyan-950/6',
                                    qualified
                                        ? 'border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.9),rgba(255,255,255,0.98))]'
                                        : 'border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))]',
                                )}
                            >
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-slate-700 shadow-sm shadow-cyan-950/5 ring-1 ring-slate-100">
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

                                <div className="grid grid-cols-6 overflow-hidden rounded-2xl border border-cyan-100 bg-white/95 text-center text-sm shadow-sm shadow-cyan-950/5">
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
                                            className="border-r border-slate-100 py-2.5 last:border-r-0"
                                        >
                                            <p className="text-[10px] font-black tracking-[0.12em] text-slate-400 uppercase">
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
                                <div className="my-3 flex items-center gap-3 px-1 text-[11px] font-black tracking-[0.18em] text-slate-400 uppercase">
                                    <span className="h-px flex-1 bg-amber-200" />
                                    <span>Qualification cutoff</span>
                                    <span className="h-px flex-1 bg-amber-200" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="hidden overflow-hidden rounded-[1.6rem] border border-cyan-100 bg-white/98 shadow-xl shadow-cyan-950/8 md:block">
                <table className="w-full min-w-[820px] border-collapse text-sm">
                    <thead className="bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(241,245,249,0.96))] text-xs text-slate-600 uppercase">
                        <tr>
                            <th className="w-16 px-5 py-4 text-left font-black tracking-[0.12em]">#</th>
                            <th className="px-5 py-4 text-left font-black tracking-[0.12em]">Team</th>
                            {stats.map((stat) => (
                                <th
                                    key={stat.key}
                                    className="w-20 px-4 py-4 text-center font-black tracking-[0.12em]"
                                >
                                    {stat.label}
                                </th>
                            ))}
                            <th className="w-24 px-4 py-4 text-center font-black tracking-[0.12em]">GD</th>
                            <th className="w-24 px-4 py-4 text-center font-black tracking-[0.12em]">Pts</th>
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
                                            'border-t border-slate-100 text-slate-900 transition-colors hover:bg-slate-50/80',
                                            qualified
                                                ? 'border-l-4 border-l-emerald-300 bg-[linear-gradient(90deg,rgba(236,253,245,0.92),rgba(255,255,255,0.98)_22%)]'
                                                : 'bg-slate-50/60',
                                        )}
                                    >
                                        <td className="px-5 py-4">
                                            <span className="inline-flex size-8 items-center justify-center rounded-full bg-white font-bold text-slate-700 shadow-sm shadow-cyan-950/5 ring-1 ring-slate-100">
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
                                                className="px-4 py-4 text-center font-black"
                                            >
                                                {team[stat.key]}
                                            </td>
                                        ))}
                                        <td className="px-4 py-4 text-center font-black">
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
