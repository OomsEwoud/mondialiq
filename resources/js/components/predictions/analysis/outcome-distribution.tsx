import { cn } from '@/lib/utils';
import type { OutcomeEstimate } from '@/types/prediction-analysis';

export default function OutcomeDistribution({
    estimates,
}: {
    estimates: OutcomeEstimate[];
}) {
    if (estimates.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Voor deze wedstrijd is nog geen volledige kansverdeling
                beschikbaar.
            </p>
        );
    }

    const highest = Math.max(...estimates.map(({ value }) => value));

    return (
        <div>
            <h3 className="text-sm font-semibold text-foreground">
                Verwachte uitkomst
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                AI-inschatting op basis van de beschikbare wedstrijdgegevens.
            </p>
            <div
                aria-hidden="true"
                className="mt-5 flex h-2.5 gap-1 overflow-hidden rounded-full"
            >
                {estimates.map(({ label, value }, index) => (
                    <span
                        key={label}
                        style={{ flexGrow: value, flexBasis: 0 }}
                        className={cn(
                            value === highest
                                ? 'bg-primary/75'
                                : index === 1
                                  ? 'bg-muted-foreground/40'
                                  : 'bg-muted-foreground/65',
                        )}
                    />
                ))}
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-3">
                {estimates.map(({ label, value }, index) => (
                    <div
                        key={label}
                        className={cn(
                            'min-w-0',
                            index === 1 && 'text-center',
                            index === 2 && 'text-right',
                        )}
                    >
                        <dt className="text-xs leading-5 break-words text-muted-foreground sm:text-sm">
                            {label}
                        </dt>
                        <dd
                            className={cn(
                                'mt-1 text-xl font-semibold tabular-nums',
                                value === highest
                                    ? 'text-primary'
                                    : 'text-foreground',
                            )}
                        >
                            {Math.round(value)}%
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
