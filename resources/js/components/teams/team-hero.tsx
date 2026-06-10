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
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-white/10 bg-slate-900 p-5 text-white sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        <span className="flex size-22 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white p-3 shadow-sm sm:size-24">
                            <img
                                src={team.logo}
                                alt={team.name}
                                className="size-full object-contain"
                            />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-bold tracking-wide text-cyan-300 uppercase">
                                National team
                            </p>
                            <h1
                                className="truncate text-4xl font-bold text-white sm:text-5xl"
                                title={team.name}
                            >
                                {team.name}
                            </h1>
                            {team.code ? (
                                <p className="mt-1 text-sm font-bold tracking-wider text-cyan-100 uppercase">
                                    {team.code}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            {visibleMetadata.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-4 sm:p-5">
                    {visibleMetadata.map((item) => (
                        <Badge
                            key={item.label}
                            variant="outline"
                            className="gap-1.5 rounded-full border-slate-200 bg-gradient-to-b from-white to-slate-50/60 px-3 py-1.5 font-bold text-slate-600 shadow-sm [&_svg]:size-3.5 [&_svg]:text-slate-600"
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
