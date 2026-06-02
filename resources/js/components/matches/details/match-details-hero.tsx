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
        <section className="overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.18),transparent_24rem),linear-gradient(135deg,#ffffff_0%,#f8fbff_48%,#eef7ff_100%)] p-5 shadow-2xl shadow-cyan-950/8 sm:p-6 lg:p-7">
            <p className="mb-5 text-center text-xs font-black tracking-[0.22em] text-cyan-700 uppercase">
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
                    <p className="text-3xl font-black text-blue-950 sm:text-4xl">
                        {scoreLabel}
                    </p>
                    <p className="mt-3 inline-flex rounded-full border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(241,245,249,0.92))] px-3 py-1 text-[10px] font-black tracking-[0.16em] text-slate-600 uppercase shadow-sm shadow-cyan-950/5 sm:text-xs">
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
