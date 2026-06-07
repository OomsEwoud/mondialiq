import { BarChart3, Brain, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    return (
        <section className="mb-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-5 shadow-sm sm:p-6">
            <header className="mb-5">
                <p className="mb-2 text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                    How it works
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Three steps to smarter predictions
                </h2>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {infoItems.map((item) => (
                    <article
                        key={item.title}
                        className={cn(
                            'flex min-h-44 flex-col rounded-2xl border bg-white p-4 shadow-sm sm:p-5',
                            item.featured
                                ? 'border-cyan-200 bg-gradient-to-b from-cyan-50/60 to-white'
                                : 'border-slate-200',
                        )}
                    >
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <span
                                className={cn(
                                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
                                    item.featured
                                        ? 'bg-cyan-600'
                                        : 'bg-slate-800',
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                            </span>
                            <span
                                className={cn(
                                    'rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase',
                                    item.featured
                                        ? 'bg-cyan-100 text-cyan-700'
                                        : 'bg-slate-100 text-slate-600',
                                )}
                            >
                                {item.badge}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                            {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            {item.description}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}
