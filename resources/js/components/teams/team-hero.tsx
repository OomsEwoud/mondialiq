import { CalendarDays, Flag, Shirt, UserRound, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/feedback/badge';
import type { TeamDetails } from '@/types/team-details';

interface Props {
    team: TeamDetails;
}

export default function TeamHero({ team }: Props) {
    const metadata = [
        {
            icon: <UsersRound />,
            label: `${team.activePlayers.length} players`,
            show: team.activePlayers.length > 0,
        },
        {
            icon: <UserRound />,
            label: team.coach?.name,
            show: Boolean(team.coach?.name),
        },
        {
            icon: <Flag />,
            label: team.country?.name,
            show: Boolean(team.country?.name),
        },
        {
            icon: <CalendarDays />,
            label: team.foundedAt ? `Founded ${team.foundedAt}` : null,
            show: Boolean(team.foundedAt),
        },
        {
            icon: <Shirt />,
            label: team.code,
            show: Boolean(team.code),
        },
    ];
    const visibleMetadata = metadata.filter((item) => item.show && item.label);

    return (
        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-linear-to-br from-blue-950 via-blue-900 to-cyan-700 p-4 text-white sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white p-3 shadow-lg shadow-blue-950/20 sm:size-24">
                            <img
                                src={team.logo}
                                alt={team.name}
                                className="size-full object-contain"
                            />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-black tracking-widest text-cyan-200 uppercase">
                                National team
                            </p>
                            <h1
                                className="truncate text-3xl font-black text-white sm:text-4xl"
                                title={team.name}
                            >
                                {team.name}
                            </h1>
                            <p className="mt-1 truncate text-sm font-bold text-cyan-100">
                                {team.country?.name ?? 'Country TBC'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:justify-end">
                        {team.country?.flag ? (
                            <img
                                src={team.country.flag}
                                alt={team.country.name}
                                className="h-11 w-16 shrink-0 rounded-lg border border-white/30 object-cover shadow-sm"
                            />
                        ) : null}
                        {team.code ? (
                            <span className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-black text-white">
                                {team.code}
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>

            {visibleMetadata.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-4 sm:p-5">
                    {visibleMetadata.map((item) => (
                        <Badge
                            key={item.label}
                            variant="outline"
                            className="gap-1.5 border-slate-200 bg-slate-50 px-2.5 py-1.5 font-black text-slate-600 [&_svg]:size-3.5 [&_svg]:text-cyan-500"
                        >
                            {item.icon}
                            <span className="max-w-44 truncate">
                                {item.label}
                            </span>
                        </Badge>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
