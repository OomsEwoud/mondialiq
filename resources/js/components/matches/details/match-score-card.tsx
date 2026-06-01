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
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-950/5 sm:p-5">
            <h2 className="mb-4 text-lg font-black text-blue-950">
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
                <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-500">
                    Score details will appear once the match is played.
                </p>
            )}
        </section>
    );
}

function hasScore(score: MatchDetailsScoreLine): boolean {
    return score.home !== null && score.away !== null;
}
