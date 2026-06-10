import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/overlays/dialog';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type {
    MatchDetailsLineupPlayer,
    MatchDetailsLineupPlayerStats,
} from '@/types/match-details';
import { formatLineupPositionLabel } from '@/utils/match-lineup';

type Props = {
    player: MatchDetailsLineupPlayer;
    teamName: string;
    isStarting: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type StatItem = {
    label: string;
    value: number;
};

type StatSectionConfig = {
    key: string;
    title: string;
    accentColor: string;
    stats: { key: keyof MatchDetailsLineupPlayerStats; label: string }[];
};

const STAT_SECTIONS: StatSectionConfig[] = [
    {
        key: 'attacking',
        title: 'Attacking',
        accentColor: 'bg-red-500',
        stats: [
            { key: 'goals', label: 'Goals' },
            { key: 'assists', label: 'Assists' },
            { key: 'shotsTotal', label: 'Shots' },
            { key: 'shotsOnTarget', label: 'On target' },
            { key: 'dribblesAttempts', label: 'Dribbles' },
            { key: 'dribblesSuccess', label: 'Dribbles success' },
        ],
    },
    {
        key: 'passing',
        title: 'Passing',
        accentColor: 'bg-blue-500',
        stats: [
            { key: 'passesTotal', label: 'Passes' },
            { key: 'passAccuracy', label: 'Accuracy %' },
            { key: 'keyPasses', label: 'Key passes' },
        ],
    },
    {
        key: 'defending',
        title: 'Defending',
        accentColor: 'bg-emerald-500',
        stats: [
            { key: 'tackles', label: 'Tackles' },
            { key: 'interceptions', label: 'Interceptions' },
            { key: 'duelsTotal', label: 'Duels' },
            { key: 'duelsWon', label: 'Duels won' },
        ],
    },
    {
        key: 'discipline',
        title: 'Discipline',
        accentColor: 'bg-amber-500',
        stats: [
            { key: 'foulsDrawn', label: 'Fouls drawn' },
            { key: 'foulsCommitted', label: 'Fouls committed' },
            { key: 'yellowCards', label: 'Yellow cards' },
            { key: 'redCards', label: 'Red cards' },
        ],
    },
    {
        key: 'goalkeeping',
        title: 'Goalkeeping',
        accentColor: 'bg-cyan-500',
        stats: [{ key: 'saves', label: 'Saves' }],
    },
];

const GK_POSITIONS = new Set(['G', 'GK', 'GOALKEEPER', 'KEEPER']);

function isGoalkeeper(position: string | null): boolean {
    if (!position) {
        return false;
    }

    return GK_POSITIONS.has(position.trim().toUpperCase());
}

function getRatingStyles(rating: number) {
    if (rating >= 8.0) {
        return {
            card: 'bg-emerald-50 border-emerald-200',
            text: 'text-emerald-800',
            subtext: 'text-emerald-600',
            label: 'text-emerald-700',
        };
    }

    if (rating >= 7.0) {
        return {
            card: 'bg-blue-50 border-blue-200',
            text: 'text-blue-800',
            subtext: 'text-blue-600',
            label: 'text-blue-700',
        };
    }

    if (rating >= 6.0) {
        return {
            card: 'bg-amber-50 border-amber-200',
            text: 'text-amber-800',
            subtext: 'text-amber-600',
            label: 'text-amber-700',
        };
    }

    return {
        card: 'bg-red-50 border-red-200',
        text: 'text-red-800',
        subtext: 'text-red-600',
        label: 'text-red-700',
    };
}

function getRatingLabel(rating: number): string {
    if (rating >= 8.0) {
        return 'Excellent';
    }

    if (rating >= 7.0) {
        return 'Good';
    }

    if (rating >= 6.0) {
        return 'Average';
    }

    return 'Poor';
}

function formatStatValue(value: number): string {
    if (Number.isInteger(value)) {
        return String(value);
    }

    return value.toFixed(1);
}

function hasMeaningfulStatValue(value: number | null): value is number {
    return value !== null && value !== undefined;
}

function extractSectionStats(
    stats: MatchDetailsLineupPlayerStats,
    section: StatSectionConfig,
): StatItem[] {
    const items: StatItem[] = [];

    for (const stat of section.stats) {
        const value = stats[stat.key];

        if (hasMeaningfulStatValue(value)) {
            let label = stat.label;

            if (stat.key === 'passAccuracy') {
                const total = stats.passesTotal;

                if (hasMeaningfulStatValue(total) && value <= total) {
                    label = 'Accurate passes';
                } else {
                    label = 'Accuracy %';
                }
            }

            items.push({ label, value: Number(value) });
        }
    }

    if (section.key === 'passing') {
        const total = stats.passesTotal;
        const accurate = stats.passAccuracy;
        
        if (
            hasMeaningfulStatValue(total) &&
            hasMeaningfulStatValue(accurate) &&
            total > 0 &&
            accurate <= total
        ) {
            const percentage = (accurate / total) * 100;
            items.push({ label: 'Accuracy %', value: percentage });
        }
    }

    return items;
}

function shouldShowSection(
    section: StatSectionConfig,
    items: StatItem[],
    isGk: boolean,
    stats: MatchDetailsLineupPlayerStats,
): boolean {
    if (items.length === 0) {
        return false;
    }

    if (section.key === 'goalkeeping' && !isGk) {
        return hasMeaningfulStatValue(stats.saves) && stats.saves > 0;
    }

    return true;
}

function getSectionOrder(isGk: boolean): string[] {
    if (isGk) {
        return [
            'goalkeeping',
            'passing',
            'discipline',
            'attacking',
            'defending',
        ];
    }

    return ['attacking', 'passing', 'defending', 'discipline', 'goalkeeping'];
}

function buildVisibleSections(
    stats: MatchDetailsLineupPlayerStats,
    isGk: boolean,
): { config: StatSectionConfig; items: StatItem[] }[] {
    const order = getSectionOrder(isGk);
    const sections: { config: StatSectionConfig; items: StatItem[] }[] = [];

    for (const key of order) {
        const config = STAT_SECTIONS.find((s) => s.key === key);

        if (!config) {
            continue;
        }

        const items = extractSectionStats(stats, config);

        if (shouldShowSection(config, items, isGk, stats)) {
            sections.push({ config, items });
        }
    }

    return sections;
}

function PrimaryStatCard({
    label,
    value,
    sublabel,
    highlight,
}: {
    label: string;
    value: string;
    sublabel?: string;
    highlight?: boolean;
}) {
    if (highlight) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-3 text-center">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {label}
                </span>
                <span className="mt-1 text-2xl leading-none font-extrabold text-slate-800">
                    {value}
                </span>
                {sublabel ? (
                    <span className="mt-0.5 text-[10px] font-bold text-slate-400 uppercase">
                        {sublabel}
                    </span>
                ) : null}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {label}
            </span>
            <span className="mt-1 text-xl leading-none font-extrabold text-slate-800">
                {value}
            </span>
            {sublabel ? (
                <span className="mt-0.5 text-[10px] font-bold text-slate-400 uppercase">
                    {sublabel}
                </span>
            ) : null}
        </div>
    );
}

export default function MatchLineupPlayerModal({
    player,
    teamName,
    isStarting,
    open,
    onOpenChange,
}: Props) {
    const getInitials = useInitials();
    const stats = player.stats;
    const isGk = isGoalkeeper(player.position);
    const visibleSections = stats ? buildVisibleSections(stats, isGk) : [];
    const rating = stats?.rating ?? null;
    const minutes = stats?.minutes ?? null;
    const goals = stats?.goals ?? null;
    const assists = stats?.assists ?? null;

    const ratingStyles = rating !== null ? getRatingStyles(rating) : null;
    const ratingLabel = rating !== null ? getRatingLabel(rating) : null;

    const hasDetailedStats = visibleSections.length > 0;
    const hasAnyStats = stats !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-md gap-0 overflow-y-auto p-0 sm:max-w-lg">
                {/* Header */}
                <div className="relative border-b border-slate-100 bg-white p-6">
                    <DialogHeader className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                        <div className="relative shrink-0">
                            <div className="rounded-full bg-white p-1 shadow-lg ring-2 ring-slate-100">
                                <Avatar
                                    className={cn(
                                        'border border-white shadow-sm',
                                        isStarting ? 'size-18' : 'size-16',
                                    )}
                                >
                                    {player.photo ? (
                                        <AvatarImage
                                            src={player.photo}
                                            alt={`${player.name} photo`}
                                            className="object-cover"
                                        />
                                    ) : null}
                                    <AvatarFallback className="bg-blue-950 text-xl font-bold text-white">
                                        {getInitials(player.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <span className="absolute -right-1 -bottom-1 flex min-w-7 items-center justify-center rounded-full border-2 border-white bg-slate-900 px-1.5 text-xs font-bold text-white shadow-md">
                                {player.number ?? '-'}
                            </span>
                        </div>

                        <div className="min-w-0">
                            <DialogTitle className="text-xl font-bold text-slate-900">
                                {player.name}
                            </DialogTitle>
                            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                                <span className="text-sm font-semibold text-slate-600">
                                    {teamName}
                                </span>
                                <span className="text-slate-300">·</span>
                                <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                                    {formatLineupPositionLabel(player.position)}
                                </span>
                                {player.isCaptain ? (
                                    <span className="inline-flex items-center rounded-md bg-blue-950 px-2 py-0.5 text-xs font-bold text-white">
                                        Captain
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {hasAnyStats ? (
                    <div className="space-y-5 px-6 py-5">
                        {/* Primary summary */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-1 rounded-full bg-slate-300" />
                                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                    Match performance
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {rating !== null && ratingStyles ? (
                                    <div
                                        className={cn(
                                            'col-span-2 flex flex-col items-center justify-center rounded-xl border-2 p-4 text-center sm:col-span-1',
                                            ratingStyles.card,
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'text-[10px] font-bold tracking-wider uppercase opacity-80',
                                                ratingStyles.label,
                                            )}
                                        >
                                            Rating
                                        </span>
                                        <span
                                            className={cn(
                                                'mt-1 text-4xl leading-none font-extrabold',
                                                ratingStyles.text,
                                            )}
                                        >
                                            {rating.toFixed(1)}
                                        </span>
                                        <span
                                            className={cn(
                                                'mt-1 text-[10px] font-bold tracking-wide uppercase',
                                                ratingStyles.subtext,
                                            )}
                                        >
                                            {ratingLabel}
                                        </span>
                                    </div>
                                ) : null}

                                {minutes !== null ? (
                                    <PrimaryStatCard
                                        label="Minutes played"
                                        value={String(minutes)}
                                    />
                                ) : null}

                                {goals !== null ? (
                                    <PrimaryStatCard
                                        label="Goals"
                                        value={String(goals)}
                                    />
                                ) : null}

                                {assists !== null ? (
                                    <PrimaryStatCard
                                        label="Assists"
                                        value={String(assists)}
                                    />
                                ) : null}
                            </div>
                        </div>

                        {/* Detailed sections */}
                        {hasDetailedStats ? (
                            <div className="space-y-5">
                                {visibleSections.map(
                                    ({ config, items }, index) => (
                                        <div
                                            key={config.key}
                                            className={cn(
                                                index > 0 &&
                                                    'border-t border-slate-100 pt-5',
                                            )}
                                        >
                                            <div className="mb-3 flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        'h-4 w-1 rounded-full',
                                                        config.accentColor,
                                                    )}
                                                />
                                                <h4 className="text-sm font-bold text-slate-700">
                                                    {config.title}
                                                </h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                {items.map((stat) => (
                                                    <div
                                                        key={stat.label}
                                                        className="flex min-h-[4.5rem] flex-col justify-center rounded-lg border border-slate-100 bg-white px-3 py-2 text-center shadow-sm"
                                                    >
                                                        <span className="text-[10px] leading-tight font-semibold tracking-wide text-slate-400 uppercase">
                                                            {stat.label}
                                                        </span>
                                                        <span className="mt-0.5 text-base font-bold text-slate-800">
                                                            {formatStatValue(
                                                                stat.value,
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center">
                                <p className="text-sm text-slate-400">
                                    No detailed match statistics available yet.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="border-t border-slate-100 px-6 py-8 text-center">
                        <p className="text-sm text-slate-400">
                            No match statistics available.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
