import type { PredictionSignal } from '@/types/prediction-analysis';

export default function DataSignals({
    signals,
}: {
    signals: PredictionSignal[];
}) {
    if (signals.length === 0) {
        return null;
    }

    return (
        <aside
            aria-labelledby="signals-heading"
            className="border-t border-border pt-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
        >
            <h2
                id="signals-heading"
                className="text-lg font-semibold text-foreground"
            >
                Datasignalen
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                De externe inschatting van API-Football, als context bij de
                MondialiQ-analyse.
            </p>
            <dl className="mt-5 divide-y divide-border">
                {signals.map(({ label, value }) => (
                    <div
                        key={label}
                        className="flex items-baseline justify-between gap-4 py-3.5 text-sm"
                    >
                        <dt className="min-w-0 text-muted-foreground">
                            {label}
                        </dt>
                        <dd className="shrink-0 text-right font-medium text-foreground tabular-nums">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Deze broninschatting kan afwijken van de AI-voorspelling.
            </p>
        </aside>
    );
}
