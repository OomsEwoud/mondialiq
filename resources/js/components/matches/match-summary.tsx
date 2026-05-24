import { Link } from '@inertiajs/react';
import MatchScoreDisplay from '@/components/matches/match-score-display';
import { cn } from '@/lib/utils';
import { show as showTeam } from '@/routes/teams';
import type { Match } from '@/types/match';
import { getWinner } from '@/utils/match-status';

interface Props {
    match: Match;
}

export default function MatchSummary({ match }: Props) {
    const winner = getWinner(match);

    return (
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-4">
            <MatchTeam
                id={match.homeTeamId}
                logo={match.homeTeamLogo}
                name={match.homeTeam}
                code={match.homeTeamShort}
                isWinner={winner === 'home'}
            />

            <MatchScoreDisplay match={match} />

            <MatchTeam
                id={match.awayTeamId}
                logo={match.awayTeamLogo}
                name={match.awayTeam}
                code={match.awayTeamShort}
                isWinner={winner === 'away'}
                align="right"
            />
        </div>
    );
}

interface MatchTeamProps {
    id: number;
    logo: string;
    name: string;
    code: string;
    isWinner: boolean;
    align?: 'left' | 'right';
}

function MatchTeam({
    id,
    logo,
    name,
    code,
    isWinner,
    align = 'left',
}: MatchTeamProps) {
    return (
        <Link
            href={showTeam.url(id)}
            className={cn(
                'flex min-w-0 items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-cyan-100 hover:bg-cyan-50/50',
                align === 'right' && 'justify-end text-right',
                isWinner && 'bg-emerald-50/70 ring-1 ring-emerald-100',
            )}
        >
            {align === 'left' ? (
                <img
                    src={logo}
                    alt={name}
                    className="size-10 shrink-0 object-contain sm:size-12"
                />
            ) : null}

            <div className="min-w-0">
                <p
                    className="truncate text-sm font-black text-blue-950 sm:text-base"
                    title={name}
                >
                    {name}
                </p>
                <span
                    className={cn(
                        'mt-1 inline-flex rounded-md border px-2 py-0.5 text-xs font-black',
                        isWinner
                            ? 'border-emerald-200 bg-white text-emerald-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500',
                    )}
                >
                    {code}
                </span>
            </div>

            {align === 'right' ? (
                <img
                    src={logo}
                    alt={name}
                    className="size-10 shrink-0 object-contain sm:size-12"
                />
            ) : null}
        </Link>
    );
}
