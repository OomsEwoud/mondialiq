import { Head, Link } from '@inertiajs/react';
import {
    BadgeCheck,
    Calculator,
    CircleDot,
    Goal,
    Scale,
    Trophy,
} from 'lucide-react';
import BackButton from '@/components/navigation/back-button';
import { predictions } from '@/routes';

const scoringRules = [
    {
        label: 'Exact score',
        points: 20,
        description:
            'Predict the full-time score exactly and you instantly receive the maximum score.',
        accent: 'bg-blue-950 text-white',
    },
    {
        label: 'Correct outcome',
        points: 8,
        description:
            'Correctly predict home win, draw, or away win when the exact score is not right.',
        accent: 'bg-cyan-50 text-cyan-800',
    },
    {
        label: 'Draw bonus',
        points: 2,
        description:
            'Earned only when the real match is a draw and you also predicted a draw.',
        accent: 'bg-cyan-50 text-cyan-800',
    },
    {
        label: 'Goal difference',
        points: 4,
        description:
            'Your predicted goal difference matches the real goal difference.',
        accent: 'bg-slate-100 text-slate-800',
    },
    {
        label: 'Home goals',
        points: 3,
        description: 'The home team goal count is exactly right.',
        accent: 'bg-slate-100 text-slate-800',
    },
    {
        label: 'Away goals',
        points: 3,
        description: 'The away team goal count is exactly right.',
        accent: 'bg-slate-100 text-slate-800',
    },
    {
        label: 'Total goals',
        points: 2,
        description: 'The total number of goals in the match is exactly right.',
        accent: 'bg-slate-100 text-slate-800',
    },
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
        points: 14,
        explanation: 'Correct draw, draw bonus and correct goal difference.',
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
            <Head title="How Points Work" />

            <div className="mb-5">
                <BackButton fallbackHref={predictions.url()} />
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-blue-950/5 sm:p-8">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                    <Calculator className="size-6" />
                </div>
                <p className="text-xs font-black tracking-[0.18em] text-cyan-600 uppercase">
                    Prediction scoring
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-5xl">
                    How points work
                </h1>
                <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                    Every user prediction is scored out of 20 after the match
                    has a final score. The system rewards exact scores first,
                    then fair partial points for outcome, goal difference and
                    goal totals.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                        Max 20 points
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">
                        Confidence does not affect points
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">
                        Draws get a small bonus
                    </span>
                </div>
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-blue-950/5 sm:p-6">
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

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {scoringRules.map((rule) => (
                            <div
                                key={rule.label}
                                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-black text-blue-950">
                                            {rule.label}
                                        </h3>
                                        <p className="mt-1 text-sm leading-5 text-slate-600">
                                            {rule.description}
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-3 py-1 text-sm font-black ${rule.accent}`}
                                    >
                                        +{rule.points}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <aside className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-5 shadow-sm shadow-blue-950/5 sm:p-6">
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
                    <div className="mt-5 grid gap-3 text-sm leading-6 text-slate-700">
                        <p>
                            Exact score always wins the full 20 points and stops
                            the calculation there.
                        </p>
                        <p>
                            If the exact score is wrong, partial points are
                            added and capped at 20.
                        </p>
                        <p>
                            Confidence is saved and shown with your prediction,
                            but it does not multiply or change the score.
                        </p>
                    </div>
                </aside>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-blue-950/5 sm:p-6">
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

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {examples.map((example) => (
                        <article
                            key={`${example.finalScore}-${example.prediction}`}
                            className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
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
                                <span className="rounded-full bg-blue-950 px-3 py-1 text-sm font-black text-white">
                                    {example.points}/20
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-blue-950/5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
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
                    <Link
                        href={predictions.url()}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-950 px-4 py-2 text-sm font-black text-white transition hover:bg-blue-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                        <CircleDot className="size-4" />
                        Go to predictions
                    </Link>
                </div>
            </section>
        </>
    );
}
