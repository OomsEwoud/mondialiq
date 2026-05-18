import TeamCodeBadge from '@/components/groups/team-code-badge';
import { stats } from '@/const/standing';
import type { GroupTeam } from '@/types/group';
import { formatGoalDifference } from '@/utils/standings';

interface Props {
    teams: GroupTeam[];
}

export default function GroupStandingsTable({ teams }: Props) {
    return (
        <>
            <div className="grid gap-3 md:hidden">
                {teams.map((team) => (
                    <article
                        key={team.id}
                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                    >
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">
                                    {team.rank}
                                </span>
                                <div className="min-w-0">
                                    <div className="mb-1">
                                        <TeamCodeBadge
                                            code={team.code}
                                            logo={team.logo}
                                        />
                                    </div>
                                    <p className="truncate font-black text-blue-950">
                                        {team.name}
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex min-w-11 items-center justify-center rounded-full bg-emerald-500 px-3 py-1 font-black text-white">
                                {team.points}
                            </span>
                        </div>

                        <div className="grid grid-cols-6 overflow-hidden rounded-md border border-slate-100 text-center text-sm">
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
                                    <p className="font-black text-blue-950">
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
                    <thead className="bg-blue-50 text-xs text-slate-600 uppercase">
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
                                className="border-t border-slate-100 text-blue-950"
                            >
                                <td className="px-4 py-4">
                                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">
                                        {team.rank}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-4">
                                        <TeamCodeBadge
                                            code={team.code}
                                            logo={team.logo}
                                        />
                                        <span className="font-black">
                                            {team.name}
                                        </span>
                                    </div>
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
                                    <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-emerald-500 px-3 py-1 font-black text-white">
                                        {team.points}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
