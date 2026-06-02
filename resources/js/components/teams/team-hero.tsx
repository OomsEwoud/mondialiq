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
        <section className="overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-white shadow-2xl shadow-cyan-950/8">
            <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.18),transparent_16rem),linear-gradient(135deg,#16255f_0%,#27408b_54%,#0f7aa2_100%)] p-5 text-white sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        <span className="flex size-22 shrink-0 items-center justify-center rounded-[1.7rem] border border-white/20 bg-white p-3 shadow-xl shadow-blue-950/20 sm:size-24">
                            <img
                                src={team.logo}
                                alt={team.name}
                                className="size-full object-contain"
                            />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-black tracking-[0.24em] text-cyan-200 uppercase">
                                National team
                            </p>
                            <h1
                                className="truncate text-4xl font-black text-white sm:text-5xl"
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
                                className="h-11 w-16 shrink-0 rounded-xl border border-white/30 object-cover shadow-lg shadow-blue-950/20"
                            />
                        ) : null}
                        {team.code ? (
                            <span className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur">
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
                            className="gap-1.5 rounded-full border-cyan-100 bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,0.96))] px-3 py-1.5 font-black text-slate-600 shadow-sm shadow-cyan-950/5 [&_svg]:size-3.5 [&_svg]:text-cyan-600"
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
