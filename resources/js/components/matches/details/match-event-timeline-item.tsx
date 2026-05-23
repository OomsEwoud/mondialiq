import { ArrowRightLeft, Goal, Monitor, Search, Target } from 'lucide-react';
import type * as React from 'react';

import { cn } from '@/lib/utils';
import type { MatchDetailsEvent } from '@/types/match-details';

type MatchEventKind =
    | 'goal'
    | 'yellow-card'
    | 'red-card'
    | 'substitution'
    | 'var'
    | 'penalty'
    | 'default';

interface Props {
    event: MatchDetailsEvent;
    isFirst: boolean;
    isLast: boolean;
}

interface EventStyle {
    marker: string;
    card: string;
    label: string;
}

const eventStyles: Record<MatchEventKind, EventStyle> = {
    goal: {
        marker: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        card: 'border-emerald-100 bg-emerald-50/60 shadow-emerald-950/5',
        label: 'text-emerald-700',
    },
    penalty: {
        marker: 'border-emerald-200 bg-white text-emerald-700',
        card: 'border-emerald-100 bg-white',
        label: 'text-emerald-700',
    },
    'yellow-card': {
        marker: 'border-yellow-200 bg-yellow-50 text-yellow-700',
        card: 'border-yellow-100 bg-white',
        label: 'text-yellow-700',
    },
    'red-card': {
        marker: 'border-red-200 bg-red-50 text-red-700',
        card: 'border-red-100 bg-white',
        label: 'text-red-700',
    },
    substitution: {
        marker: 'border-blue-200 bg-blue-50 text-blue-700',
        card: 'border-slate-200 bg-white',
        label: 'text-blue-700',
    },
    var: {
        marker: 'border-violet-200 bg-violet-50 text-violet-700',
        card: 'border-slate-200 bg-white',
        label: 'text-violet-700',
    },
    default: {
        marker: 'border-slate-200 bg-white text-slate-500',
        card: 'border-slate-200 bg-white',
        label: 'text-slate-600',
    },
};

export default function MatchEventTimelineItem({
    event,
    isFirst,
    isLast,
}: Props) {
    const kind = matchEventKind(event);
    const style = eventStyles[kind];
    const secondaryText = secondaryEventText(event, kind);

    return (
        <div className="grid grid-cols-[2.75rem_1.75rem_minmax(0,1fr)] gap-2 sm:grid-cols-[3.25rem_2rem_minmax(0,1fr)] sm:gap-3">
            <div className="pt-3 text-right text-xs font-black text-blue-700 tabular-nums sm:text-sm">
                {formatMinute(event)}
            </div>

            <div className="relative flex justify-center">
                <span
                    className={cn(
                        'absolute w-px bg-slate-200',
                        isFirst ? 'top-4' : 'top-0',
                        isLast ? 'bottom-auto h-4' : 'bottom-0',
                    )}
                />
                <span
                    className={cn(
                        'relative z-10 mt-2 flex size-7 items-center justify-center rounded-full border shadow-xs',
                        style.marker,
                    )}
                >
                    {renderMatchEventIcon(kind)}
                </span>
            </div>

            <article
                className={cn(
                    'group mb-2 min-w-0 rounded-lg border px-3 py-2.5 shadow-xs transition-colors hover:border-blue-200 hover:bg-blue-50/40 sm:px-4',
                    style.card,
                    kind === 'goal' && 'py-3',
                )}
            >
                <div className="flex min-w-0 items-start gap-3">
                    <img
                        src={event.teamLogo}
                        alt={event.team}
                        className="mt-0.5 size-6 shrink-0 object-contain sm:size-7"
                    />
                    <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                            <p
                                className={cn(
                                    'truncate text-sm font-black',
                                    style.label,
                                )}
                            >
                                {formatMatchEventType(event)}
                            </p>
                            <span className="min-w-0 truncate text-xs font-medium text-slate-400">
                                {event.team}
                            </span>
                        </div>
                        <p
                            className={cn(
                                'mt-1 truncate text-sm text-slate-800',
                                kind === 'goal' && 'font-bold',
                            )}
                        >
                            {primaryEventText(event, kind)}
                        </p>
                        {secondaryText ? (
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                                {secondaryText}
                            </p>
                        ) : null}
                    </div>
                </div>
            </article>
        </div>
    );
}

function matchEventKind(event: MatchDetailsEvent): MatchEventKind {
    const value = `${event.type} ${event.detail}`.toLowerCase();

    if (value.includes('var')) {
        return 'var';
    }

    if (value.includes('penalty')) {
        return 'penalty';
    }

    if (value.includes('substitution') || value.includes('subst')) {
        return 'substitution';
    }

    if (value.includes('red card')) {
        return 'red-card';
    }

    if (value.includes('yellow card')) {
        return 'yellow-card';
    }

    if (value.includes('goal')) {
        return 'goal';
    }

    return 'default';
}

function renderMatchEventIcon(kind: MatchEventKind): React.ReactNode {
    if (kind === 'goal') {
        return <Goal className="size-3.5" aria-hidden="true" />;
    }

    if (kind === 'penalty') {
        return <Target className="size-3.5" aria-hidden="true" />;
    }

    if (kind === 'substitution') {
        return <ArrowRightLeft className="size-3.5" aria-hidden="true" />;
    }

    if (kind === 'var') {
        return <Monitor className="size-3.5" aria-hidden="true" />;
    }

    if (kind === 'yellow-card' || kind === 'red-card') {
        return (
            <span
                className="block h-4 w-2.5 rounded-[2px] bg-current"
                aria-hidden="true"
            />
        );
    }

    return <Search className="size-3.5" aria-hidden="true" />;
}

function formatMatchEventType(event: MatchDetailsEvent): string {
    const kind = matchEventKind(event);

    if (kind === 'goal') {
        return event.detail === 'Normal Goal'
            ? 'Goal'
            : cleanDetail(event.detail);
    }

    if (kind === 'yellow-card') {
        return 'Yellow card';
    }

    if (kind === 'red-card') {
        return 'Red card';
    }

    if (kind === 'substitution') {
        return 'Substitution';
    }

    if (kind === 'var') {
        return 'VAR review';
    }

    if (kind === 'penalty') {
        return cleanDetail(event.detail);
    }

    return cleanDetail(event.detail);
}

function primaryEventText(
    event: MatchDetailsEvent,
    kind: MatchEventKind,
): string {
    if (kind === 'substitution') {
        if (event.player && event.assist) {
            return `${event.assist} -> ${event.player}`;
        }

        return event.player ?? event.assist ?? event.team;
    }

    return event.player ?? event.team;
}

function secondaryEventText(
    event: MatchDetailsEvent,
    kind: MatchEventKind,
): string | null {
    if (kind === 'goal' && event.assist) {
        return `Assist: ${event.assist}`;
    }

    if (kind === 'substitution' && event.player && event.assist) {
        return 'Player out -> player in';
    }

    if (kind !== 'goal' && kind !== 'substitution' && event.assist) {
        return `Involved: ${event.assist}`;
    }

    return null;
}

function cleanDetail(detail: string): string {
    return detail.replace(/\s+\d+$/, '').trim();
}

function formatMinute(event: MatchDetailsEvent): string {
    return event.extraTime
        ? `${event.minute}+${event.extraTime}'`
        : `${event.minute}'`;
}
