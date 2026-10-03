import { cn } from '@/lib/utils';
import type { Match } from '@/types/match';

export default function AnalysisProbabilities({ match }: { match: Match }) {
    const chances = match.prediction;
    const outcomes = [
        {
            label: match.homeTeam,
            value: chances?.homeWin,
            color: 'bg-[#6fae88]',
        },
        { label: 'Gelijkspel', value: chances?.draw, color: 'bg-[#87958c]' },
        {
            label: match.awayTeam,
            value: chances?.awayWin,
            color: 'bg-[#405b4b]',
        },
    ];
    const hasProbabilities = outcomes.every(
        ({ value }) =>
            typeof value === 'number' &&
            Number.isFinite(value) &&
            value >= 0 &&
            value <= 100,
    );

    if (!hasProbabilities) {
        return (
            <p className="text-sm text-[#949d97]">
                Winstkansen nog niet beschikbaar.
            </p>
        );
    }

    return (
        <div>
            <div
                aria-hidden="true"
                className="flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-[#262c29]"
            >
                {outcomes.map(({ label, value, color }) => (
                    <span
                        key={label}
                        className={color}
                        style={{ width: `${value}%` }}
                    />
                ))}
            </div>
            <dl
                aria-label="Kansen volgens het AI-model"
                className="mt-3 grid grid-cols-3 gap-3"
            >
                {outcomes.map(({ label, value }, index) => (
                    <div
                        key={label}
                        className={cn(
                            'flex min-w-0 flex-col gap-1',
                            index === 1 && 'text-center',
                            index === 2 && 'text-right',
                        )}
                    >
                        <dt className="order-2 text-xs leading-5 break-words text-[#949d97]">
                            {label}
                        </dt>
                        <dd className="text-xl font-bold tracking-tight text-[#daddd9] tabular-nums">
                            {Math.round(value!)}
                            <span className="ml-0.5 text-xs font-medium text-[#949d97]">
                                %
                            </span>
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
