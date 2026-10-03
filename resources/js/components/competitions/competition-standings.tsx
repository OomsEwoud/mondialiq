import { Link } from '@inertiajs/react';
import { useState } from 'react';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import { show as teamShow } from '@/routes/teams';
import type { CompetitionStandingGroup } from '@/types/competition';

export default function CompetitionStandings({
    groups,
    preview = false,
}: {
    groups: CompetitionStandingGroup[];
    preview?: boolean;
}) {
    const [selectedGroup, setSelectedGroup] = useState(0);
    const group = groups[selectedGroup];

    if (groups.length === 0) {
        return (
            <p className="py-5 text-sm text-[#7f8882]">
                De stand is nog niet beschikbaar.
            </p>
        );
    }

    const rows = preview ? group.teams.slice(0, 5) : group.teams;

    return (
        <div>
            {groups.length > 1 && !preview && (
                <div
                    role="group"
                    aria-label="Kies een groep"
                    className="mb-5 flex gap-2 overflow-x-auto pb-2"
                >
                    {groups.map((item, index) => (
                        <button
                            key={item.name}
                            type="button"
                            aria-pressed={selectedGroup === index}
                            onClick={() => setSelectedGroup(index)}
                            className={`min-h-10 shrink-0 border-b-2 px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none ${selectedGroup === index ? 'border-[#6fae88] text-white' : 'border-transparent text-[#949d97] hover:text-white'}`}
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
            )}
            {group && (
                <>
                    {groups.length > 1 && preview && (
                        <p className="mb-2 text-xs font-medium tracking-wide text-[#949d97] uppercase">
                            {group.name}
                        </p>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[540px] border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-[#343b37] text-[10px] font-semibold tracking-wide text-[#7f8882] uppercase">
                                    <th className="w-9 py-3 text-left">#</th>
                                    <th className="py-3 text-left">Team</th>
                                    <th className="w-10 py-3 text-center">
                                        GS
                                    </th>
                                    <th className="w-10 py-3 text-center">W</th>
                                    <th className="w-10 py-3 text-center">G</th>
                                    <th className="w-10 py-3 text-center">V</th>
                                    <th className="w-16 py-3 text-center">
                                        GF-GA
                                    </th>
                                    <th className="w-12 py-3 text-center">
                                        DS
                                    </th>
                                    <th className="w-12 py-3 text-right">
                                        Ptn
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((team) => (
                                    <tr
                                        key={team.id}
                                        className="border-b border-[#262c29] last:border-b-0"
                                    >
                                        <td className="py-3 text-xs text-[#949d97] tabular-nums">
                                            {team.rank}
                                        </td>
                                        <td className="py-2">
                                            <Link
                                                href={teamShow.url(team.id)}
                                                className="flex min-w-0 items-center gap-2 text-[#daddd9] transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                                            >
                                                <ImageWithFallback
                                                    src={
                                                        team.logoUrl ??
                                                        undefined
                                                    }
                                                    alt=""
                                                    className="size-6 shrink-0 object-contain"
                                                />
                                                <span className="truncate text-xs font-medium sm:text-sm">
                                                    {team.name}
                                                </span>
                                                {group.advanceCount !== null &&
                                                    team.rank <=
                                                        group.advanceCount && (
                                                        <span className="shrink-0 text-[10px] font-semibold text-[#9ecbad]">
                                                            Door
                                                        </span>
                                                    )}
                                            </Link>
                                        </td>
                                        {[
                                            team.played,
                                            team.wins,
                                            team.draws,
                                            team.losses,
                                        ].map((value, index) => (
                                            <td
                                                key={index}
                                                className="py-3 text-center text-xs text-[#949d97] tabular-nums"
                                            >
                                                {value}
                                            </td>
                                        ))}
                                        <td className="py-3 text-center text-xs text-[#949d97] tabular-nums">
                                            {team.goalsFor}–{team.goalsAgainst}
                                        </td>
                                        <td className="py-3 text-center text-xs text-[#949d97] tabular-nums">
                                            {team.goalDifference > 0
                                                ? `+${team.goalDifference}`
                                                : team.goalDifference}
                                        </td>
                                        <td className="py-3 text-right text-xs font-bold text-white tabular-nums">
                                            {team.points}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
