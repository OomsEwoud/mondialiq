import { Link } from '@inertiajs/react';
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
import PageHead from '@/components/seo/page-head';
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
        accent: 'bg-cyan-50 text-cyan-700',
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

const validationPoints = [
    'Predictions are scored after the fixture is finished and the final score is available.',
    'MondialIQ automatically validates finished fixtures on a scheduled basis, for example every few hours.',
    'Once your prediction has been validated, you can see how many points you earned and why.',
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
            <PageHead
                title="How Scoring Works"
                description="Learn how MondialIQ scores World Cup predictions out of 20 points, including exact scores, outcomes, goal difference and partial points."
            />

            <div className="mb-5">
                <BackButton fallbackHref={predictions.url()} />
            </div>

            <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-6 text-center shadow-sm sm:p-8">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <Calculator className="size-5" />
                </div>
                <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                    Prediction scoring
                </p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    How scoring works
                </h1>
                <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                    Every prediction is scored out of 20 after the final
                    whistle. Exact scores win the full score, partial points
                    reward close predictions.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                    <span className="rounded-full border border-cyan-200 bg-[linear-gradient(180deg,rgba(236,254,255,1),rgba(207,250,254,0.88))] px-3 py-1 text-xs font-semibold text-cyan-600 shadow-sm">
                        Max 20 points
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                        Confidence does not affect points
                    </span>
                </div>
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-xl shadow-sm sm:p-6">
                <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-start">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-sm">
                        <BadgeCheck className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                            Validation
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                            When points are awarded
                        </h2>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                            MondialIQ automatically checks on a fixed schedule,
                            for example every few hours, which matches have
                            finished. Points are then awarded using the existing
                            scoring system.
                        </p>
                        <div className="mt-4 grid gap-2.5 md:grid-cols-3">
                            {validationPoints.map((point) => (
                                <div
                                    key={point}
                                    className="rounded-2xl border border-slate-200 bg-cyan-50/60 p-4 text-sm leading-6 font-semibold text-slate-700 shadow-sm"
                                >
                                    {point}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
                <article className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-xl shadow-sm sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-sm">
                            <Trophy className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                Rules
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                                Points breakdown
                            </h2>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {scoringRules.map((rule) => (
                            <div
                                key={rule.label}
                                className="h-full rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm"
                            >
                                <div className="flex h-full items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            {rule.label}
                                        </h3>
                                        <p className="mt-1 text-sm leading-5 text-slate-600">
                                            {rule.description}
                                        </p>
                                    </div>
                                    <span
                                        className={
                                            rule.isMaximum
                                                ? 'shrink-0 rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white shadow-sm'
                                                : 'shrink-0 rounded-full border border-slate-200 bg-[linear-gradient(180deg,rgba(236,254,255,1),rgba(207,250,254,0.88))] px-3 py-1 text-sm font-semibold text-cyan-700 shadow-sm'
                                        }
                                    >
                                        +{rule.points}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <aside className="rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.16),transparent_18rem),linear-gradient(180deg,rgba(248,255,255,0.98),rgba(236,254,255,0.88))] p-5 shadow-xl shadow-sm sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm ring-slate-200">
                            <Scale className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                Fairness
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                                Simple by design
                            </h2>
                        </div>
                    </div>
                    <div className="mt-5 grid gap-2.5">
                        {fairnessPoints.map((point) => (
                            <div
                                key={point}
                                className="flex gap-3 rounded-2xl border border-white/80 bg-white/80 p-4 text-sm leading-6 font-semibold text-slate-700 shadow-sm"
                            >
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-cyan-600" />
                                <span>{point}</span>
                            </div>
                        ))}
                    </div>
                </aside>
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-xl shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 ring-1 ring-slate-200">
                        <Goal className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                            Examples
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                            Real scoring examples
                        </h2>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {examples.map((example) => (
                        <article
                            key={`${example.finalScore}-${example.prediction}`}
                            className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                        Final {example.finalScore}
                                    </p>
                                    <h3 className="mt-1 text-lg font-semibold text-slate-900">
                                        Prediction {example.prediction}
                                    </h3>
                                    <p className="mt-2 text-sm leading-5 text-slate-600">
                                        {example.explanation}
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white shadow-sm">
                                    {example.points}/20
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.14),transparent_18rem),linear-gradient(180deg,rgba(248,255,255,0.98),rgba(239,246,255,0.9))] p-5 shadow-xl shadow-sm sm:p-6">
                <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm ring-slate-200">
                        <BadgeCheck className="size-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">
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
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sm transition  focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                        >
                            <Calculator className="size-4" />
                            Go to predictions
                        </Link>
                        <Link
                            href={matches.url()}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
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
