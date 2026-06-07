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
    const visibleScoreRows = scoreRows.filter(([, key]) =>
        shouldShowScoreRow(match, key),
    );
    const hasAnyScore = visibleScoreRows.some(([, key]) =>
        hasScore(match.score[key]),
    );

    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-bold text-slate-900">
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
                <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 font-medium text-slate-500">
                    Score details will appear once the match is played.
                </p>
            )}
        </section>
    );
}

function shouldShowScoreRow(
    match: MatchDetails,
    key: keyof MatchDetails['score'],
): boolean {
    if (key === 'halftime') {
        return isHalftimeScoreAvailable(match);
    }

    if (key === 'fulltime') {
        return isFulltimeScoreAvailable(match);
    }

    return hasScore(match.score[key]);
}

function hasScore(score: MatchDetailsScoreLine): boolean {
    return score.home !== null && score.away !== null;
}

function isHalftimeScoreAvailable(match: MatchDetails): boolean {
    const status = normalizedStatus(match);

    return (
        hasScore(match.score.halftime) &&
        (['ht', '2h', 'et', 'bt', 'p', 'ft', 'aet', 'pen'].includes(status) ||
            [
                'half time',
                'halftime',
                'second half',
                'extra time',
                'break time',
                'penalty',
                'finished',
            ].some((availableStatus) => status.includes(availableStatus)))
    );
}

function isFulltimeScoreAvailable(match: MatchDetails): boolean {
    const status = normalizedStatus(match);

    return (
        hasScore(match.score.fulltime) &&
        (['ft', 'aet', 'pen'].includes(status) || status.includes('finished'))
    );
}

function normalizedStatus(match: MatchDetails): string {
    return (match.statusShort ?? match.status).trim().toLowerCase();
}
