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
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-black text-blue-950">
                Score details
            </h2>
            <div className="flex flex-col gap-2">
                {scoreRows.map(([label, key]) => (
                    <ScoreRow
                        key={key}
                        label={label}
                        score={match.score[key]}
                    />
                ))}
            </div>
        </section>
    );
}

interface ScoreRowProps {
    label: string;
    score: MatchDetailsScoreLine;
}

function ScoreRow({ label, score }: ScoreRowProps) {
    const value =
        score.home === null || score.away === null
            ? 'Not available'
            : `${score.home} - ${score.away}`;

    return (
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-500">{label}</span>
            <span className="font-black text-blue-950">{value}</span>
        </div>
    );
}
