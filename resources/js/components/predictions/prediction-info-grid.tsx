import {
    BarChart3,
    Brain,
    TrendingUp,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';
import {
    subscribeToInstructions,
    instructionsExpanded,
    instructionsServerSnapshot,
    setInstructionsExpanded,
} from '@/utils/prediction-instructions';

const infoItems = [
    {
        title: 'AI Predictions',
        description:
            'Model prediction based on match data, market signals and team context.',
        icon: Brain,
        badge: 'Step 1',
        featured: true,
    },
    {
        title: 'Your Predictions',
        description: 'Lock in your own score, winner and confidence level.',
        icon: TrendingUp,
        badge: 'Step 2',
        featured: false,
    },
    {
        title: 'Compare',
        description:
            'See where your instinct matches or differs from the model output.',
        icon: BarChart3,
        badge: 'Step 3',
        featured: false,
    },
];

export default function PredictionInfoGrid() {
    const isExpanded = useSyncExternalStore(
        subscribeToInstructions,
        instructionsExpanded,
        instructionsServerSnapshot,
    );
    const toggleExpand = () => setInstructionsExpanded(!isExpanded);

    return (
        <section className="mt-5 mb-5 rounded-2xl border border-border bg-gradient-to-b from-card to-card/80 p-4">
            <div className="group flex items-start justify-between gap-4 select-none">
                <header className={cn(isExpanded && 'mb-5', 'flex-1')}>
                    <p className="mb-1 text-xs font-semibold tracking-wide text-primary uppercase">
                        How it works
                    </p>
                    <h2 className="text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                        Three steps to smarter predictions
                    </h2>
                </header>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand();
                    }}
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-colors group-hover:bg-muted group-hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-expanded={isExpanded}
                    aria-label={
                        isExpanded
                            ? 'Collapse instructions'
                            : 'Expand instructions'
                    }
                >
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                    ) : (
                        <ChevronDown className="h-5 w-5" />
                    )}
                </button>
            </div>

            {isExpanded && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {infoItems.map((item) => (
                        <article
                            key={item.title}
                            className={cn(
                                'flex min-h-44 flex-col rounded-2xl border bg-card p-4 shadow-sm sm:p-5',
                                item.featured
                                    ? 'border-border bg-gradient-to-b from-accent/60 to-card'
                                    : 'border-border',
                            )}
                        >
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <span
                                    className={cn(
                                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-foreground shadow-sm',
                                        item.featured
                                            ? 'bg-primary'
                                            : 'bg-muted',
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                </span>
                                <span
                                    className={cn(
                                        'rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase',
                                        item.featured
                                            ? 'bg-accent text-primary'
                                            : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {item.badge}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground">
                                {item.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {item.description}
                            </p>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
