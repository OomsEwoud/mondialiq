import { ArrowUpRight, Flag, UsersRound } from 'lucide-react';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import type { TeamDetails } from '@/types/team-details';

interface Props {
    team: TeamDetails;
}

export default function TeamHero({ team }: Props) {
    const metadata = [
        { icon: <Flag />, label: team.country?.name },
        { icon: <UsersRound />, label: `${team.activePlayers.length} spelers` },
    ].filter((item) => item.label);

    return (
        <section className="relative overflow-hidden rounded-xl border border-[#292e2b] bg-[#101211] px-5 py-6 sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(180,190,182,0.045),transparent_68%)]" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
                <span className="flex size-24 shrink-0 items-center justify-center rounded-xl border border-[#343d37] bg-[#e9eeea] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.22)] sm:size-32 sm:p-5">
                    <ImageWithFallback
                        src={team.logo}
                        alt={team.name}
                        className="size-full object-contain"
                    />
                </span>
                <div className="min-w-0">
                    <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-[#929a95] uppercase">
                        Nationaal team
                    </p>
                    <div className="mt-3 flex min-w-0 flex-wrap items-end gap-3">
                        <h1
                            className="min-w-0 text-4xl leading-none font-black tracking-tight text-[#f3f4f1] sm:text-6xl"
                            title={team.name}
                        >
                            {team.name}
                        </h1>
                    </div>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#9aa39d] sm:text-base">
                        Selectie en teaminformatie
                        {team.country?.name ? ` · ${team.country.name}` : ''}
                    </p>
                    {metadata.length > 0 ? (
                        <div className="mt-5 flex flex-wrap gap-2">
                            {metadata.map((item) => (
                                <span
                                    key={item.label}
                                    className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#303432] bg-[#171918]/90 px-3 text-xs font-medium text-[#bdc5bf] [&_svg]:size-3.5 [&_svg]:text-[#858e88]"
                                >
                                    {item.icon}
                                    {item.label}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </div>
                <ArrowUpRight
                    className="absolute top-5 right-5 hidden size-4 text-[#68756c] sm:block"
                    aria-hidden="true"
                />
            </div>
        </section>
    );
}
