import { Head, Link } from '@inertiajs/react';
import {
    BadgeCheck,
    CalendarDays,
    Calculator,
    CheckCircle2,
    Goal,
    Scale,
    Trophy,
} from 'lucide-react';
import BackButton from '@/components/navigation/back-button';
import { matches, predictions } from '@/routes';

const scoringRules = [
    {
        label: 'Exact score',
        points: 20,
        description:
            'Predict the full-time score exactly and instantly receive the maximum.',
        isMaximum: true,
    },
    {
        label: 'Correct outcome',
        points: 8,
        description:
            'Correctly predict home win, draw, or away win when the exact score is not right.',
        accent: 'bg-cyan-50 text-cyan-800',
    },
    {
        label: 'Goal difference',
        points: 4,
        description:
            'Your predicted goal difference matches the real goal difference.',
    },
    {
        label: 'Home goals',
        points: 3,
        description: 'The home team goal count is exactly right.',
    },
    {
        label: 'Away goals',
        points: 3,
        description: 'The away team goal count is exactly right.',
    },
    {
        label: 'Total goals',
        points: 2,
        description: 'The total number of goals in the match is exactly right.',
    },
];

const fairnessPoints = [
    'Exact score always wins the full 20 points.',
    'If the score is not exact, partial points reward close predictions.',
    'Confidence is saved, but does not multiply your score.',
];

const examples = [
    {
        finalScore: '2-1',
        prediction: '2-1',
        points: 20,
        explanation: 'Exact score, so no extra partial points are added.',
    },
    {
        finalScore: '2-1',
        prediction: '3-1',
        points: 11,
        explanation: 'Correct outcome plus exact away goals.',
    },
    {
        finalScore: '2-2',
        prediction: '1-1',
        points: 12,
        explanation: 'Correct draw outcome and correct goal difference.',
    },
    {
        finalScore: '1-1',
        prediction: '2-1',
        points: 3,
        explanation: 'Wrong outcome, but the away team goals are correct.',
    },
];

export default function ScoringGuide() {
    return (
        <>
            <Head title="How Scoring Works" />

            <div className="mb-5">
                <BackButton fallbackHref={predictions.url()} />
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-blue-950/5 sm:p-6">
                <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                    <Calculator className="size-5" />
                </div>
                <p className="text-xs font-black tracking-[0.18em] text-cyan-600 uppercase">
                    Prediction scoring
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
                    How scoring works
                </h1>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                    Every prediction is scored out of 20 after the final
                    whistle. Exact scores win the full score, partial points
                    reward close predictions.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                        Max 20 points
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">
                        Confidence does not affect points
                    </span>
                </div>
            </section>

            <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-950/5 sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-950 text-white">
                            <Trophy className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black tracking-[0.18em] text-cyan-600 uppercase">
                                Rules
                            </p>
                            <h2 className="mt-1 text-2xl font-black text-blue-950">
                                Points breakdown
                            </h2>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {scoringRules.map((rule) => (
                            <div
                                key={rule.label}
                                className="h-full rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4"
                            >
                                <div className="flex h-full items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-black text-blue-950">
                                            {rule.label}
                                        </h3>
                                        <p className="mt-1 text-sm leading-5 text-slate-600">
                                            {rule.description}
                                        </p>
                                    </div>
                                    <span
                                        className={
                                            rule.isMaximum
                                                ? 'shrink-0 rounded-full bg-blue-950 px-3 py-1 text-sm font-black text-white'
                                                : 'shrink-0 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-sm font-black text-cyan-800'
                                        }
                                    >
                                        +{rule.points}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <aside className="rounded-2xl border border-cyan-100 bg-cyan-50/40 p-4 shadow-sm shadow-blue-950/5 sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-700 ring-1 ring-cyan-100">
                            <Scale className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black tracking-[0.18em] text-cyan-700 uppercase">
                                Fairness
                            </p>
                            <h2 className="mt-1 text-2xl font-black text-blue-950">
                                Simple by design
                            </h2>
                        </div>
                    </div>
                    <div className="mt-5 grid gap-2.5">
                        {fairnessPoints.map((point) => (
                            <div
                                key={point}
                                className="flex gap-3 rounded-xl border border-white/70 bg-white/75 p-3 text-sm leading-5 font-semibold text-slate-700"
                            >
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-cyan-700" />
                                <span>{point}</span>
                            </div>
                        ))}
                    </div>
                </aside>
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-950/5 sm:p-6">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                        <Goal className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-black tracking-[0.18em] text-cyan-600 uppercase">
                            Examples
                        </p>
                        <h2 className="mt-1 text-2xl font-black text-blue-950">
                            Real scoring examples
                        </h2>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {examples.map((example) => (
                        <article
                            key={`${example.finalScore}-${example.prediction}`}
                            className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
                                        Final {example.finalScore}
                                    </p>
                                    <h3 className="mt-1 text-lg font-black text-blue-950">
                                        Prediction {example.prediction}
                                    </h3>
                                    <p className="mt-2 text-sm leading-5 text-slate-600">
                                        {example.explanation}
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full bg-blue-950 px-3 py-1 text-sm font-black text-white">
                                    {example.points}/20
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-950/5 sm:p-6">
                <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                        <BadgeCheck className="size-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-blue-950">
                            Ready to make predictions?
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                            Use this scoring guide when comparing your picks on
                            Predictions and the Leaderboards.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                        <Link
                            href={predictions.url()}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                        >
                            <Calculator className="size-4" />
                            Go to predictions
                        </Link>
                        <Link
                            href={matches.url()}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                        >
                            <CalendarDays className="size-4" />
                            View matches
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
