import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Clock3,
    Home,
    LockKeyhole,
    RefreshCcw,
    Search,
    ServerCrash,
    ShieldAlert,
    Sparkles,
    TimerReset,
} from 'lucide-react';
import AppLogo from '@/components/app/app-logo';
import { Button } from '@/components/ui/forms/button';
import { cn } from '@/lib/utils';
import { home, matches, predictions } from '@/routes';

type ErrorPageProps = {
    status: number;
};

type ErrorAction = {
    href: string;
    icon: typeof Home;
    label: string;
};

type ErrorConfig = {
    accent: string;
    accentBg: string;
    action?: ErrorAction;
    description: string;
    icon: typeof Home;
    kicker: string;
    title: string;
};

const errorConfig: Record<number, ErrorConfig> = {
    403: {
        accent: 'text-amber-600',
        accentBg: 'bg-amber-50 ring-amber-200',
        action: {
            href: predictions.url(),
            icon: Sparkles,
            label: 'View predictions',
        },
        description:
            'You do not have permission to view this page. Some prediction zones are reserved for the right squad.',
        icon: LockKeyhole,
        kicker: 'Restricted area',
        title: 'You do not have permission to view this page.',
    },
    404: {
        accent: 'text-cyan-600',
        accentBg: 'bg-cyan-50 ring-cyan-200',
        action: {
            href: matches.url(),
            icon: CalendarDays,
            label: 'Browse matches',
        },
        description:
            'This match could not be found. It may have moved, finished, or never made the tournament schedule.',
        icon: Search,
        kicker: 'Lost possession',
        title: 'This match could not be found.',
    },
    419: {
        accent: 'text-blue-700',
        accentBg: 'bg-blue-50 ring-blue-200',
        description:
            'Your session expired. Please refresh and try again before submitting your next prediction.',
        icon: TimerReset,
        kicker: 'Session timeout',
        title: 'Your session expired. Please refresh and try again.',
    },
    429: {
        accent: 'text-orange-600',
        accentBg: 'bg-orange-50 ring-orange-200',
        action: {
            href: matches.url(),
            icon: CalendarDays,
            label: 'Check fixtures',
        },
        description:
            'Too many requests. Please slow down for a moment so MondialIQ can keep the match feed steady.',
        icon: Clock3,
        kicker: 'Slow the tempo',
        title: 'Too many requests. Please slow down.',
    },
    500: {
        accent: 'text-red-600',
        accentBg: 'bg-red-50 ring-red-200',
        action: {
            href: predictions.url(),
            icon: Sparkles,
            label: 'Go to predictions',
        },
        description:
            'Something went wrong on our side. The team has dropped the ball, but your browser is still in play.',
        icon: ServerCrash,
        kicker: 'Unexpected stoppage',
        title: 'Something went wrong on our side.',
    },
    503: {
        accent: 'text-slate-600',
        accentBg: 'bg-slate-50 ring-slate-200',
        description:
            'MondialIQ is temporarily unavailable. We are tuning the platform for the next prediction window.',
        icon: ShieldAlert,
        kicker: 'Maintenance break',
        title: 'MondialIQ is temporarily unavailable.',
    },
};

const fallbackConfig: ErrorConfig = {
    accent: 'text-cyan-600',
    accentBg: 'bg-cyan-50 ring-cyan-200',
    action: {
        href: matches.url(),
        icon: CalendarDays,
        label: 'Browse matches',
    },
    description:
        'The match page could not be loaded. Head back to the tournament hub and try again.',
    icon: ShieldAlert,
    kicker: 'Match interrupted',
    title: 'Something went offside.',
};

export default function ErrorPage({ status }: ErrorPageProps) {
    const config = errorConfig[status] ?? fallbackConfig;
    const StatusIcon = config.icon;
    const ActionIcon = config.action?.icon;

    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();

            return;
        }

        router.visit(home.url());
    };

    return (
        <>
            <Head title={`${status} - ${config.title}`}>
                <meta
                    head-key="robots"
                    name="robots"
                    content="noindex,nofollow"
                />
                <meta
                    head-key="description"
                    name="description"
                    content={config.description}
                />
            </Head>

            <div className="flex min-h-screen flex-col bg-slate-50">
                <header className="border-b border-slate-200 bg-white shadow-sm">
                    <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                        <Link
                            href={home.url()}
                            className="rounded-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                        >
                            <AppLogo />
                        </Link>
                    </div>
                </header>

                <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:py-12">
                    <div className="w-full max-w-2xl">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
                            <div className="flex flex-col items-start gap-6">
                                <div
                                    className={cn(
                                        'flex size-14 items-center justify-center rounded-2xl ring-1 shadow-sm',
                                        config.accentBg,
                                    )}
                                >
                                    <StatusIcon className={cn('size-6', config.accent)} />
                                </div>

                                <div className="min-w-0">
                                    <p
                                        className={cn(
                                            'text-xs font-bold tracking-wide uppercase',
                                            config.accent,
                                        )}
                                    >
                                        {config.kicker}
                                    </p>
                                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                        {config.title}
                                    </h1>
                                    <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
                                        {config.description}
                                    </p>
                                </div>

                                <div className="flex w-full flex-wrap gap-3">
                                    <Button
                                        asChild
                                        className="h-11 rounded-xl px-5 text-sm font-semibold"
                                    >
                                        <Link href={home.url()}>
                                            <Home className="size-4" />
                                            Go home
                                        </Link>
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={goBack}
                                        className="h-11 rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                    >
                                        <ArrowLeft className="size-4" />
                                        Go back
                                    </Button>

                                    {status === 419 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                window.location.reload()
                                            }
                                            className="h-11 rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                        >
                                            <RefreshCcw className="size-4" />
                                            Refresh page
                                        </Button>
                                    )}

                                    {config.action && ActionIcon && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="h-11 rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                        >
                                            <Link href={config.action.href}>
                                                <ActionIcon className="size-4" />
                                                {config.action.label}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 border-t border-slate-100 pt-6">
                                <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                                    Details
                                </p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    <StatusPill
                                        label="Status"
                                        value={`${status}`}
                                    />
                                    <StatusPill
                                        label="Platform"
                                        value="MondialIQ"
                                    />
                                    <StatusPill
                                        label="Next move"
                                        value={
                                            status === 419
                                                ? 'Refresh and retry'
                                                : 'Return to play'
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

function StatusPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                {label}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
        </div>
    );
}
