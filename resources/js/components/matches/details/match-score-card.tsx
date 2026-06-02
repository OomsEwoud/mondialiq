import MatchScoreRow from '@/components/matches/details/match-score-row';
import type {
    MatchDetails,
    MatchDetailsScoreLine,
} from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

const scoreRows: Array<[string, keyof MatchDetails['score']]> = [
    ['Halftime', 'halftime'],
    ['Fulltime', 'fulltime'],
    ['Extra time', 'extratime'],
    ['Penalties', 'penalties'],
];

export default function MatchScoreCard({ match }: Props) {
    const hasAnyScore = Object.values(match.score).some(hasScore);
    const visibleScoreRows = scoreRows.filter(([, key]) => {
        if (key === 'halftime' || key === 'fulltime') {
            return true;
        }

        return hasScore(match.score[key]);
    });

    return (
        <section className="rounded-[1.8rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] p-5 shadow-xl shadow-cyan-950/8 sm:p-6">
            <h2 className="mb-5 text-2xl font-black text-blue-950">
                Score details
            </h2>
            <div className="flex flex-col gap-2">
                {visibleScoreRows.map(([label, key]) => (
                    <MatchScoreRow
                        key={key}
                        label={label}
                        score={match.score[key]}
                    />
                ))}
            </div>
            {!hasAnyScore && (
                <p className="mt-4 rounded-2xl border border-dashed border-cyan-100 bg-slate-50/80 px-4 py-4 text-sm font-medium leading-6 text-slate-500">
                    Score details will appear once the match is played.
                </p>
            )}
        </section>
    );
}

function hasScore(score: MatchDetailsScoreLine): boolean {
    return score.home !== null && score.away !== null;
}
