import { Link } from '@inertiajs/react';
import { ArrowUpRight, Check, Gauge, Sparkles } from 'lucide-react';

import { predictions } from '@/routes';

const teams = [
    {
        name: 'Arsenal',
        logo: 'https://media.api-sports.io/football/teams/42.png',
        goals: 2,
        probability: 48,
        xg: '1.9',
    },
    {
        name: 'Liverpool',
        logo: 'https://media.api-sports.io/football/teams/40.png',
        goals: 1,
        probability: 25,
        xg: '1.2',
    },
] as const;

const reasons = [
    'Arsenal won 4 van de laatste 5 thuiswedstrijden',
    'Liverpool incasseerde in 4 van de laatste 5 uitduels',
    'Arsenal creëert thuis gemiddeld meer grote kansen',
] as const;

export default function PredictionPreview() {
    return (
        <div className="relative mx-auto w-full max-w-[36rem] lg:mr-0">
            <div className="absolute -inset-3 rounded-[2rem] border border-[#1f2522] bg-[#111513]/40" />
            <article className="relative overflow-hidden rounded-[1.5rem] border border-[#303732] bg-[#111513] shadow-2xl shadow-black/30">
                <header className="flex items-center justify-between border-b border-[#262c29] px-5 py-4 sm:px-7">
                    <div className="flex items-center gap-2.5">
                        <span className="rounded-md border border-[#303732] px-2 py-1 text-[0.65rem] font-bold tracking-[0.16em] text-[#aab1ac]">
                            PL
                        </span>
                        <span className="text-xs font-medium text-[#7f8882]">
                            Vandaag · 18:30
                        </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2b4636] bg-[#153024] px-2.5 py-1 text-[0.65rem] font-semibold text-[#8bc5a1]">
                        <Sparkles className="size-3" aria-hidden="true" />
                        AI-analyse gereed
                    </span>
                </header>
                <div className="px-5 pt-6 sm:px-7 sm:pt-7">
                    <p className="text-center text-[0.65rem] font-semibold tracking-[0.16em] text-[#68706b] uppercase">
                        Verwachte uitslag
                    </p>
                    <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
                        <Team team={teams[0]} />
                        <span className="text-4xl font-black tracking-[-0.06em] text-white tabular-nums sm:text-5xl">
                            {teams[0].goals}–{teams[1].goals}
                        </span>
                        <Team team={teams[1]} />
                    </div>
                    <div className="mt-7 rounded-xl border border-[#262c29] bg-[#0e1210] p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-semibold text-[#aeb5b0]">
                                Winstkansen
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8bc5a1]">
                                <Gauge
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                                68% confidence
                            </span>
                        </div>
                        <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-[#202622]">
                            <span className="w-[48%] bg-[#57ad78]" />
                            <span className="w-[27%] bg-[#68706b]" />
                            <span className="w-[25%] bg-[#39413c]" />
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                            <Probability label="Arsenal" value="48%" />
                            <Probability
                                label="Gelijk"
                                value="27%"
                                align="center"
                            />
                            <Probability
                                label="Liverpool"
                                value="25%"
                                align="right"
                            />
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#262c29] bg-[#262c29]">
                        {teams.map((team) => (
                            <div
                                key={team.name}
                                className="bg-[#141916] px-4 py-3.5"
                            >
                                <span className="text-[0.65rem] font-semibold tracking-[0.12em] text-[#68706b] uppercase">
                                    xG · {team.name}
                                </span>
                                <strong className="mt-1 block text-xl font-bold text-[#e3e5e1] tabular-nums">
                                    {team.xg}
                                </strong>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 border-t border-[#262c29] pt-5">
                        <p className="text-xs font-semibold text-[#aeb5b0]">
                            Waarom deze voorspelling?
                        </p>
                        <ul className="mt-3 space-y-2.5">
                            {reasons.map((reason) => (
                                <li
                                    key={reason}
                                    className="flex gap-2.5 text-xs leading-5 text-[#7f8882]"
                                >
                                    <Check
                                        className="mt-0.5 size-3.5 shrink-0 text-[#57ad78]"
                                        aria-hidden="true"
                                    />
                                    {reason}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <Link
                    href={predictions()}
                    className="group mt-6 flex min-h-14 items-center justify-between border-t border-[#303732] bg-[#171c19] px-5 text-sm font-semibold text-[#daddd9] transition hover:bg-[#1c221e] focus-visible:ring-2 focus-visible:ring-[#36a96b] focus-visible:outline-none focus-visible:ring-inset sm:px-7"
                >
                    Bekijk volledige analyse
                    <ArrowUpRight
                        className="size-4 text-[#7f8882] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                        aria-hidden="true"
                    />
                </Link>
            </article>
        </div>
    );
}

function Team({ team }: { team: (typeof teams)[number] }) {
    return (
        <div className="flex min-w-0 flex-col items-center gap-2.5 text-center">
            <div className="flex size-14 items-center justify-center rounded-xl bg-[#f3f4f1] p-2 sm:size-18 sm:p-2.5">
                <img
                    src={team.logo}
                    alt=""
                    className="size-full object-contain"
                />
            </div>
            <span className="truncate text-xs font-bold text-[#f3f4f1] sm:text-sm">
                {team.name}
            </span>
        </div>
    );
}

function Probability({
    label,
    value,
    align = 'left',
}: {
    label: string;
    value: string;
    align?: 'left' | 'center' | 'right';
}) {
    const alignment =
        align === 'center'
            ? 'text-center'
            : align === 'right'
              ? 'text-right'
              : 'text-left';

    return (
        <div className={alignment}>
            <strong className="block text-[#daddd9]">{value}</strong>
            <span className="mt-0.5 block text-[#68706b]">{label}</span>
        </div>
    );
}
