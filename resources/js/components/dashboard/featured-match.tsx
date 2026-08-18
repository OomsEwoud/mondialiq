import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import { show as showMatch } from '@/routes/matches';
import type { Match } from '@/types/match';

export default function FeaturedMatch({ match }: { match: Match }) {
    const prediction = match.aiPrediction;
    const chances = match.prediction;
    const favorite = highestProbability(chances);

    return (
        <article className="overflow-hidden rounded-2xl border border-[#303732] bg-[#111513]">
            <div className="flex items-center justify-between border-b border-[#262c29] px-5 py-4 sm:px-7">
                <div>
                    <span className="text-[0.65rem] font-semibold tracking-[0.14em] text-[#6fae88] uppercase">
                        Uitgelicht
                    </span>
                    <p className="mt-1 text-xs text-[#7f8882]">
                        {match.leagueName ?? match.round} · {match.date}{' '}
                        {match.time}
                    </p>
                </div>
                {prediction?.confidence && (
                    <span className="rounded-full border border-[#2b4636] bg-[#153024] px-2.5 py-1 text-[0.65rem] font-semibold text-[#8bc5a1]">
                        Zekerheid · {prediction.confidence}%
                    </span>
                )}
            </div>
            <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    <Team name={match.homeTeam} logo={match.homeTeamLogo} />
                    <div className="text-center">
                        <span className="text-[0.65rem] font-semibold tracking-[0.12em] text-[#68706b] uppercase">
                            AI voorspelling
                        </span>
                        <strong className="mt-2 block text-5xl font-black tracking-[-0.06em] text-white tabular-nums">
                            {score(prediction?.homeScore)}–
                            {score(prediction?.awayScore)}
                        </strong>
                    </div>
                    <Team name={match.awayTeam} logo={match.awayTeamLogo} />
                </div>
                <div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-[#202622]">
                        <span
                            className={
                                favorite === 'home'
                                    ? 'bg-[#57ad78]'
                                    : 'bg-[#46504a]'
                            }
                            style={{ width: `${chances?.homeWin ?? 0}%` }}
                        />
                        <span
                            className={
                                favorite === 'draw'
                                    ? 'bg-[#57ad78]'
                                    : 'bg-[#69716c]'
                            }
                            style={{ width: `${chances?.draw ?? 0}%` }}
                        />
                        <span
                            className={
                                favorite === 'away'
                                    ? 'bg-[#57ad78]'
                                    : 'bg-[#303732]'
                            }
                            style={{ width: `${chances?.awayWin ?? 0}%` }}
                        />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <Chance
                            label={match.homeTeamShort}
                            value={chances?.homeWin}
                        />
                        <Chance label="Gelijk" value={chances?.draw} center />
                        <Chance
                            label={match.awayTeamShort}
                            value={chances?.awayWin}
                            right
                        />
                    </div>
                    <p className="mt-5 line-clamp-2 text-sm leading-6 text-[#949d97]">
                        {chances
                            ? insight(match, favorite)
                            : (prediction?.advice ??
                              'Bekijk de volledige analyse voor deze wedstrijd.')}
                    </p>
                    <Link
                        href={showMatch(match.id)}
                        className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#daddd9] hover:text-white focus-visible:ring-2 focus-visible:ring-[#36a96b] focus-visible:outline-none"
                    >
                        Bekijk analyse
                        <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </div>
            </div>
        </article>
    );
}

function Team({ name, logo }: { name: string; logo: string }) {
    return (
        <div className="flex min-w-0 flex-col items-center gap-3 text-center">
            <div className="flex size-16 items-center justify-center rounded-xl bg-[#f3f4f1] p-2.5">
                <img src={logo} alt="" className="size-full object-contain" />
            </div>
            <span className="max-w-28 text-sm font-bold text-[#e3e5e1]">
                {name}
            </span>
        </div>
    );
}
function Chance({
    label,
    value,
    center,
    right,
}: {
    label: string;
    value?: number;
    center?: boolean;
    right?: boolean;
}) {
    return (
        <div className={center ? 'text-center' : right ? 'text-right' : ''}>
            <strong className="block text-[#daddd9]">
                {value !== undefined ? `${Math.round(value)}%` : '—'}
            </strong>
            <span className="text-[#68706b]">{label}</span>
        </div>
    );
}
function score(value?: number | null) {
    return value === null || value === undefined ? '—' : Math.round(value);
}

function highestProbability(chances: Match['prediction']) {
    if (!chances) {
        return null;
    }

    const highest = Math.max(chances.homeWin, chances.draw, chances.awayWin);

    if (chances.homeWin === highest) {
        return 'home';
    }

    if (chances.awayWin === highest) {
        return 'away';
    }

    return 'draw';
}

function insight(
    match: Match,
    favorite: ReturnType<typeof highestProbability>,
) {
    if (favorite === 'home') {
        return `MondialiQ geeft ${match.homeTeam} een licht voordeel.`;
    }

    if (favorite === 'away') {
        return `MondialiQ verwacht dat ${match.awayTeam} de beste papieren heeft.`;
    }

    return 'MondialiQ verwacht een wedstrijd met weinig verschil tussen beide teams.';
}
