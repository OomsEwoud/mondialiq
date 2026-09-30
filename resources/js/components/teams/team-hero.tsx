import { CalendarDays, Flag, Shirt, UserRound, UsersRound } from 'lucide-react';
import type { TeamDetails } from '@/types/team-details';

interface Props {
    team: TeamDetails;
}

export default function TeamHero({ team }: Props) {
    const metadata = [
        {
            icon: <UsersRound />,
            label: `${team.activePlayers.length} spelers`,
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
            label: team.foundedAt ? `Opgericht in ${team.foundedAt}` : null,
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
        <section className="border-b border-[#29312c] pb-8 sm:pb-10">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:gap-8">
                <span className="flex size-28 shrink-0 items-center justify-center rounded-lg border border-[#343d37] bg-[#edf1ed] p-4 sm:size-36 sm:p-5">
                    <img
                        src={team.logo}
                        alt={team.name}
                        className="size-full object-contain"
                    />
                </span>
                <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-bold text-[#70b98e] uppercase">
                        <span className="size-1.5 rounded-full bg-[#57ad78]" />
                        Nationaal elftal
                    </p>
                    <div className="mt-3 flex min-w-0 flex-wrap items-end gap-3">
                        <h1
                            className="min-w-0 text-5xl leading-none font-black text-[#f3f4f1] sm:text-7xl"
                            title={team.name}
                        >
                            {team.name}
                        </h1>
                        {team.code ? (
                            <span className="mb-1 rounded-sm border border-[#4b775d] bg-[#17251d] px-2.5 py-1 text-xs font-bold text-[#8fd0a8] uppercase sm:mb-2">
                                {team.code}
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-[#89928c] sm:text-base">
                        Selectie, staf en kerngegevens voor het huidige
                        internationale seizoen.
                    </p>
                </div>
            </div>

            {visibleMetadata.length > 0 ? (
                <div className="mt-8 grid grid-cols-2 border-y border-[#29312c] sm:grid-cols-3 lg:grid-cols-5">
                    {visibleMetadata.map((item) => (
                        <div
                            key={item.label}
                            className="flex min-w-0 items-center gap-2 border-r border-[#29312c] px-3 py-3 text-sm font-semibold text-[#b8bfba] last:border-r-0 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[#70b98e]"
                        >
                            {item.icon}
                            <span className="truncate">{item.label}</span>
                        </div>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
