import MatchScoreRow from '@/components/matches/details/match-score-row';
import type {
    MatchDetails,
    MatchDetailsScoreLine,
} from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

const scoreRows: Array<[string, keyof MatchDetails['score']]> = [
    ['Rust', 'halftime'],
    ['Eindstand', 'fulltime'],
    ['Verlenging', 'extratime'],
    ['Strafschoppen', 'penalties'],
];

export default function MatchScoreCard({ match }: Props) {
    const visibleScoreRows = scoreRows.filter(([, key]) =>
        shouldShowScoreRow(match, key),
    );
    const hasAnyScore = visibleScoreRows.some(([, key]) =>
        hasScore(match.score[key]),
    );

    return (
        <section className="border-t border-border/70 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-foreground">
                Scoreverloop
            </h2>
            <div className="flex flex-col divide-y divide-border/60">
                {visibleScoreRows.map(([label, key]) => (
                    <MatchScoreRow
                        key={key}
                        label={label}
                        score={match.score[key]}
                    />
                ))}
            </div>
            {!hasAnyScore && (
                <p className="text-sm leading-6 text-muted-foreground">
                    De scores verschijnen zodra de wedstrijd is gespeeld.
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
