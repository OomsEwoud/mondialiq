import { Link } from '@inertiajs/react';
import { show as showTeam } from '@/routes/teams';
import type { MatchDetails } from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

export default function MatchDetailsHero({ match }: Props) {
    const score = match.score.fulltime;
    const hasScore = score.home !== null && score.away !== null;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="mb-5 text-center text-xs font-black tracking-widest text-cyan-500 uppercase">
                {match.round}
            </p>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <TeamBlock
                    id={match.homeTeam.id}
                    logo={match.homeTeam.logo}
                    name={match.homeTeam.name}
                    code={match.homeTeam.code}
                />
                <div className="text-center">
                    <p className="text-3xl font-black text-blue-950">
                        {hasScore ? `${score.home} - ${score.away}` : 'vs'}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-400">
                        {match.status}
                    </p>
                </div>
                <TeamBlock
                    id={match.awayTeam.id}
                    logo={match.awayTeam.logo}
                    name={match.awayTeam.name}
                    code={match.awayTeam.code}
                    align="right"
                />
            </div>
        </section>
    );
}

interface TeamBlockProps {
    id: number;
    logo: string;
    name: string;
    code: string;
    align?: 'left' | 'right';
}

function TeamBlock({ id, logo, name, code, align = 'left' }: TeamBlockProps) {
    const isRightAligned = align === 'right';

    return (
        <Link
            href={showTeam.url(id)}
            className={`flex min-w-0 items-center gap-3 rounded-lg p-2 transition-colors hover:bg-blue-50 ${isRightAligned ? 'flex-row-reverse text-right' : ''}`}
        >
            <img src={logo} alt={name} className="h-12 w-12 object-contain" />
            <div className="min-w-0">
                <p className="truncate text-lg font-black text-blue-950">
                    {name}
                </p>
                <p className="text-xs font-bold text-slate-400">{code}</p>
            </div>
        </Link>
    );
}
