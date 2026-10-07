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
    action?: ErrorAction;
    description: string;
    icon: typeof Home;
    kicker: string;
    title: string;
};

const errorConfig: Record<number, ErrorConfig> = {
    403: {
        accent: 'text-amber-600',
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
        accent: 'text-primary',
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
        accent: 'text-blue-200',
        description:
            'Your session expired. Please refresh and try again before submitting your next prediction.',
        icon: TimerReset,
        kicker: 'Session timeout',
        title: 'Your session expired. Please refresh and try again.',
    },
    429: {
        accent: 'text-orange-600',
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
        accent: 'text-destructive',
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
        accent: 'text-foreground',
        description:
            'MondialIQ is temporarily unavailable. We are tuning the platform for the next prediction window.',
        icon: ShieldAlert,
        kicker: 'Maintenance break',
        title: 'MondialIQ is temporarily unavailable.',
    },
};

const fallbackConfig: ErrorConfig = {
    accent: 'text-primary',
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

            <div className="min-h-screen w-full overflow-x-hidden bg-muted font-sans text-foreground">
                <header className="border-b border-border/10 bg-secondary shadow-lg shadow-sm">
                    <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-5 sm:px-6">
                        <Link
                            href={home.url()}
                            className="rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                        >
                            <AppLogo textClassName="text-primary" />
                        </Link>
                    </div>
                </header>

                <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center px-5 py-8 sm:px-6 lg:py-12">
                    <section className="w-full overflow-hidden rounded-2xl border border-border/30 bg-card shadow-2xl shadow-sm">
                        <div className="grid min-h-[62vh] gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:p-10">
                            <div className="min-w-0">
                                <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-card text-primary shadow-sm ring-1 ring-border">
                                    <StatusIcon className="size-6" />
                                </div>

                                <p className="text-xs font-bold tracking-wide text-primary uppercase">
                                    {config.kicker}
                                </p>
                                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                                    <span
                                        className={cn(
                                            'text-6xl leading-none font-bold tracking-tight sm:text-7xl',
                                            config.accent,
                                        )}
                                    >
                                        {status}
                                    </span>
                                    <h1 className="max-w-2xl text-3xl leading-tight font-bold tracking-tight text-foreground sm:text-4xl">
                                        {config.title}
                                    </h1>
                                </div>

                                <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                                    {config.description}
                                </p>

                                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                    <Button
                                        asChild
                                        className="h-11 rounded-full px-5 font-semibold"
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
                                        className="h-11 rounded-full border-border bg-card px-5 font-semibold text-foreground hover:border-border hover:bg-accent hover:text-primary"
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
                                            className="h-11 rounded-full border-border bg-card px-5 font-semibold text-foreground hover:border-border hover:bg-accent hover:text-primary"
                                        >
                                            <RefreshCcw className="size-4" />
                                            Refresh page
                                        </Button>
                                    )}

                                    {config.action && ActionIcon && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="h-11 rounded-full border-border bg-card px-5 font-semibold text-foreground hover:border-border hover:bg-accent hover:text-primary"
                                        >
                                            <Link href={config.action.href}>
                                                <ActionIcon className="size-4" />
                                                {config.action.label}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <aside className="rounded-2xl border border-white/80 bg-card/80 p-5 shadow-sm shadow-xl ring-1 ring-border/50">
                                <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                                    Match report
                                </p>
                                <div className="mt-4 grid gap-3">
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
                            </aside>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}

function StatusPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-border bg-muted px-4 py-3">
            <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
        </div>
    );
}
