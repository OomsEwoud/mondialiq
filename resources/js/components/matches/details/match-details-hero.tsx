import MatchDetailsTeamBlock from '@/components/matches/details/match-details-team-block';
import type { MatchDetails } from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

export default function MatchDetailsHero({ match }: Props) {
    const score = match.score.fulltime;
    const hasScore = score.home !== null && score.away !== null;
    const scoreLabel = hasScore ? `${score.home} - ${score.away}` : 'vs';

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-950/5 sm:p-5 lg:p-6">
            <p className="mb-4 text-center text-xs font-black tracking-widest text-cyan-600 uppercase">
                {match.round}
            </p>

            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
                <MatchDetailsTeamBlock
                    id={match.homeTeam.id}
                    logo={match.homeTeam.logo}
                    name={match.homeTeam.name}
                    code={match.homeTeam.code}
                />
                <div className="text-center">
                    <p className="text-2xl font-black text-blue-950 sm:text-3xl">
                        {scoreLabel}
                    </p>
                    <p className="mt-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black tracking-wide text-slate-500 uppercase sm:text-xs">
                        {match.status}
                    </p>
                </div>
                <MatchDetailsTeamBlock
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
