import { Link } from '@inertiajs/react';
import {
    Brain,
    Calculator,
    CalendarDays,
    CheckCircle2,
    Clock,
    Eye,
    Flag,
    Globe,
    HelpCircle,
    Lock,
    MessageSquareWarning,
    Rocket,
    Shield,
    Trophy,
    Users,
} from 'lucide-react';
import BackButton from '@/components/navigation/back-button';
import PageHead from '@/components/seo/page-head';
import { home, leaderboards, matches, predictions, scoring } from '@/routes';

const scoringRules = [
    {
        label: 'Exact full-time score',
        points: 20,
        description:
            'Predict the final score exactly and instantly receive the maximum points.',
        isMaximum: true,
    },
    {
        label: 'Correct outcome',
        points: 8,
        description:
            'Correctly predict home win, draw, or away win when the exact score is not right.',
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

const predictionSteps = [
    {
        step: 1,
        title: 'Choose a match',
        description: 'Browse upcoming World Cup fixtures.',
    },
    {
        step: 2,
        title: 'Enter your score',
        description: 'Predict the full-time result.',
    },
    {
        step: 3,
        title: 'Submit before kickoff',
        description: 'Predictions lock when the match starts.',
    },
    {
        step: 4,
        title: 'Wait for validation',
        description: 'Points are calculated after the final whistle.',
    },
    {
        step: 5,
        title: 'Earn points',
        description: 'Climb the leaderboard with every correct call.',
    },
];

const predictionStates = [
    {
        label: 'Open',
        icon: Clock,
        description:
            'The match has not started yet. You can still create or edit your prediction.',
    },
    {
        label: 'Locked',
        icon: Lock,
        description:
            'The match has started. Predictions can no longer be edited.',
    },
    {
        label: 'Pending validation',
        icon: HelpCircle,
        description:
            'The match is finished but points have not been calculated yet.',
    },
    {
        label: 'Validated',
        icon: CheckCircle2,
        description:
            'Points have been calculated and are visible on your profile and leaderboards.',
    },
];

const highlightCards = [
    {
        label: 'Predict matches',
        icon: Flag,
        description: 'Make score predictions before kickoff.',
    },
    {
        label: 'Compare with AI',
        icon: Brain,
        description: 'See AI-generated insights for every match.',
    },
    {
        label: 'Earn points',
        icon: Trophy,
        description: 'Score up to 20 points per correct prediction.',
    },
];

export default function HowItWorks() {
    return (
        <>
            <PageHead
                title="How MondialIQ Works"
                description="Learn how MondialIQ predictions, AI insights, scoring and leaderboards work for the World Cup 2026."
            />

            <div className="mb-5">
                <BackButton fallbackHref={home.url()} />
            </div>

            {/* 1. Hero */}
            <section className="rounded-2xl border border-slate-700/50 bg-slate-900 p-6 text-center shadow-lg sm:p-8">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-slate-800 text-cyan-300 sm:size-14">
                    <Rocket className="size-5" />
                </div>
                <p className="text-xs font-semibold tracking-wide text-cyan-300 uppercase">
                    Getting started
                </p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    How MondialIQ Works
                </h1>
                <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                    Predict World Cup matches, compare your choices with AI
                    insights, and climb the leaderboard.
                </p>

                <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                    {highlightCards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4 text-left shadow-sm"
                        >
                            <card.icon className="size-5 text-cyan-300" />
                            <h3 className="mt-2 text-sm font-bold text-white">
                                {card.label}
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-slate-400">
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. What is MondialiQ? */}
            <section className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                        <Globe className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                            Platform
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            What is MondialIQ?
                        </h2>
                    </div>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                    MondialIQ is a World Cup 2026 prediction platform where
                    users can follow matches, make predictions, compare them
                    with AI-generated insights and compete in leaderboards or
                    prediction groups.
                </p>
            </section>

            {/* 3. Match predictions */}
            <section className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                        <Flag className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                            Predictions
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            Match predictions
                        </h2>
                    </div>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                    Users can predict the final score of upcoming matches.
                    Predictions must be submitted before the match starts. After
                    kickoff, predictions are locked. You can still view your
                    prediction, but not edit it anymore. Predictions can be
                    compared with AI predictions where available.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {predictionSteps.map((s) => (
                        <div
                            key={s.step}
                            className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                            <span className="absolute top-3 right-3 text-xs font-bold text-slate-300">
                                0{s.step}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900">
                                {s.title}
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-slate-600">
                                {s.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. AI predictions */}
            <section className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                        <Brain className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                            AI insights
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            AI predictions
                        </h2>
                    </div>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                    AI predictions are generated from available football data.
                    They can include expected result, score suggestion,
                    probabilities or match insights depending on available data.
                    AI predictions are not guaranteed outcomes. They are meant
                    as an extra reference for users.
                </p>
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                    <div className="flex items-start gap-3">
                        <MessageSquareWarning className="mt-0.5 size-5 shrink-0 text-amber-600" />
                        <div>
                            <p className="text-sm font-bold text-amber-800">
                                Disclaimer
                            </p>
                            <p className="mt-1 text-sm leading-5 text-amber-700">
                                AI predictions are insights, not certainties.
                                They are generated from data models and should
                                not be used as betting advice.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Point scoring system */}
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
                <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm sm:p-6">
                    <div className="flex items-start gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                            <Calculator className="size-5" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                Scoring
                            </p>
                            <h2 className="mt-1 text-xl font-bold text-slate-900">
                                Point scoring system
                            </h2>
                        </div>
                    </div>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                        Points are only awarded after the match has finished.
                        Points may require validation before appearing in
                        leaderboards. Pending predictions can show no points
                        yet.
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {scoringRules.map((rule) => (
                            <div
                                key={rule.label}
                                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                            >
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        {rule.label}
                                    </h3>
                                    <p className="mt-1 text-sm leading-5 text-slate-600">
                                        {rule.description}
                                    </p>
                                </div>
                                <span
                                    className={
                                        rule.isMaximum
                                            ? 'shrink-0 rounded-full bg-slate-900 px-3 py-1 text-sm font-bold text-white'
                                            : 'shrink-0 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-700'
                                    }
                                >
                                    +{rule.points}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm leading-6 text-slate-600">
                            <strong className="text-slate-900">
                                Exact score
                            </strong>{' '}
                            always wins the full 20 points. If the score is not
                            exact, partial points reward close predictions. The
                            total is capped at 20 points.{' '}
                            <Link
                                href={scoring.url()}
                                className="font-semibold text-cyan-700 underline-offset-2 hover:underline"
                            >
                                View detailed scoring guide
                            </Link>
                        </p>
                    </div>
                </section>

                <aside className="rounded-2xl border border-cyan-200 bg-gradient-to-b from-cyan-50/60 to-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-start gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm ring-1 ring-cyan-200">
                            <Shield className="size-5" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                Fairness
                            </p>
                            <h2 className="mt-1 text-xl font-bold text-slate-900">
                                Simple by design
                            </h2>
                        </div>
                    </div>
                    <div className="mt-5 grid gap-2.5">
                        {[
                            'Exact score always wins the full 20 points.',
                            'If the score is not exact, partial points reward close predictions.',
                            'Confidence is saved, but does not multiply your score.',
                            'Prediction groups can optionally use custom scoring rules.',
                        ].map((point) => (
                            <div
                                key={point}
                                className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 font-semibold text-slate-700 shadow-sm"
                            >
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-cyan-600" />
                                <span>{point}</span>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

            {/* 6. Prediction states */}
            <section className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                        <Eye className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                            Lifecycle
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            Prediction states
                        </h2>
                    </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {predictionStates.map((state) => (
                        <div
                            key={state.label}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-center gap-2">
                                <state.icon className="size-4 text-cyan-600" />
                                <h3 className="text-sm font-bold text-slate-900">
                                    {state.label}
                                </h3>
                            </div>
                            <p className="mt-2 text-sm leading-5 text-slate-600">
                                {state.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 7. Leaderboards & prediction groups */}
            <section className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                        <Users className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                            Competition
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            Leaderboards & prediction groups
                        </h2>
                    </div>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                    Users can compete on leaderboards. Prediction groups allow
                    friends and classmates to compete together. Scores are based
                    on validated prediction points. Private groups with invite
                    codes can be created so only invited members can join.
                    Prediction groups can optionally enable custom scoring rules
                    and boosted predictions for extra points.
                </p>
            </section>

            {/* 8. Privacy & sharing */}
            <section className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                        <Shield className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                            Privacy
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            Privacy & sharing
                        </h2>
                    </div>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                    Depending on your privacy settings, predictions can be kept
                    private or shared publicly when sharing is enabled. Private
                    predictions stay visible only to you. Public predictions can
                    be viewed by others and shared with a link.
                </p>
            </section>

            {/* 9. Data availability */}
            <section className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                        <CalendarDays className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                            Data
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            Data availability
                        </h2>
                    </div>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                    Some statistics only become available close to kickoff or
                    after the match. Lineups, player stats and detailed match
                    events depend on the external football data provider. If
                    data is missing, MondialIQ shows empty states instead of
                    unreliable information.
                </p>
                <div className="mt-4 grid gap-2.5 md:grid-cols-3">
                    {[
                        'Lineups may appear only minutes before kickoff.',
                        'Live match events are updated as the provider delivers them.',
                        'Player stats are available after the match is finished.',
                    ].map((point) => (
                        <div
                            key={point}
                            className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 font-semibold text-slate-700 shadow-sm"
                        >
                            {point}
                        </div>
                    ))}
                </div>
            </section>

            {/* 10. Final CTA */}
            <section className="mt-5 rounded-2xl border border-cyan-200 bg-gradient-to-b from-cyan-50/40 to-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                            <Rocket className="size-5" />
                        </span>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Ready to predict?
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                Start exploring matches, make your first
                                prediction and see how you stack up against AI
                                and other users.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Link
                            href={matches.url()}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                        >
                            <Flag className="size-4" />
                            View matches
                        </Link>
                        <Link
                            href={predictions.url()}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                        >
                            <Trophy className="size-4" />
                            Explore predictions
                        </Link>
                        <Link
                            href={leaderboards.url()}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                        >
                            <Users className="size-4" />
                            View leaderboards
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
