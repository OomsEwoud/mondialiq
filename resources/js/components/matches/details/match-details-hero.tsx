import MatchDetailsTeamBlock from '@/components/matches/details/match-details-team-block';
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
                <MatchDetailsTeamBlock
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
