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
                            'rounded-2xl border bg-white p-3 shadow-sm',
                            team.rank <= 2
                                ? 'border-cyan-200 bg-cyan-50/30'
                                : 'border-slate-200',
                        )}
                    >
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-700">
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
                                        <span className="mt-1 ml-1.5 inline-flex rounded-full border border-cyan-200 bg-white px-2 py-0.5 text-[10px] font-black text-cyan-700">
                                            Advances
                                        </span>
                                    )}
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
                                    formatGoalDifference(team.goalDifference),
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
                ))}
            </div>

            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                <table className="w-full min-w-[720px] border-collapse text-sm">
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
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team) => (
                            <tr
                                key={team.id}
                                className={cn(
                                    'border-t border-slate-100 text-slate-900 transition-colors hover:bg-slate-50',
                                    team.rank <= 2 &&
                                        'border-l-4 border-l-cyan-300 bg-cyan-50/30',
                                )}
                            >
                                <td className="px-4 py-4">
                                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">
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
