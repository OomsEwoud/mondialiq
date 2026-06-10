import PointsBadge from '@/components/groups/points-badge';
import TeamStandingLink from '@/components/groups/team-standing-link';
import { stats } from '@/const/standing';
import { cn } from '@/lib/utils';
import type { GroupTeam } from '@/types/group';
import { formatGoalDifference } from '@/utils/standings';

interface Props {
    teams: GroupTeam[];
}

export function GroupStandingsTable({ teams }: Props) {
    return (
        <>
            <div className="grid gap-3 md:hidden">
                {teams.map((team) => (
                    <article
                        key={team.id}
                        className={cn(
                            'rounded-xl border p-3 shadow-sm',
                            team.rank <= 2
                                ? 'border-cyan-200 bg-cyan-50/40'
                                : 'border-slate-200 bg-white',
                        )}
                    >
                        <div className="mb-2.5 flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                                    {team.rank}
                                </span>
                                <div className="min-w-0">
                                    <TeamStandingLink
                                        id={team.id}
                                        code={team.code}
                                        logo={team.logo}
                                        name={team.name}
                                    />
                                    {team.rank <= 2 && (
                                        <span className="ml-2 inline-flex rounded-full border border-cyan-200 bg-white px-2 py-0.5 text-[10px] font-bold text-cyan-700 uppercase shadow-sm">
                                            Advances
                                        </span>
                                    )}
                                </div>
                            </div>
                            <PointsBadge points={team.points} />
                        </div>

                        <div className="grid grid-cols-5 overflow-hidden rounded-lg border border-slate-200 bg-white text-center shadow-sm">
                            {[
                                ...stats.map((stat) => [
                                    stat.label,
                                    team[stat.key],
                                ]),
                                [
                                    'GD',
                                    formatGoalDifference(team.goalDifference),
                                ],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="border-r border-slate-100 py-1.5 last:border-r-0"
                                >
                                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                        {label}
                                    </p>
                                    <p className="text-sm font-bold text-slate-900">
                                        {value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </article>
                ))}
            </div>

            <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:block">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                    <thead className="bg-gradient-to-b from-slate-50 to-white text-xs text-slate-600 uppercase">
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
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team) => (
                            <tr
                                key={team.id}
                                className={cn(
                                    'border-t border-slate-100 text-slate-900 transition-colors hover:bg-slate-50/80',
                                    team.rank <= 2 &&
                                        'border-l-4 border-l-cyan-300 bg-cyan-50/30',
                                )}
                            >
                                <td className="px-5 py-4">
                                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-white font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
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
                                    {formatGoalDifference(team.goalDifference)}
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <PointsBadge points={team.points} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default GroupStandingsTable;
