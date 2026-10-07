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
import {
    PrimaryStatCard,
    RatingStatCard,
    SecondaryStatCard,
} from './player-stat-card';

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
        accentColor: 'bg-brand-subtle',
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
            card: 'bg-emerald-950/40 border-emerald-200',
            text: 'text-emerald-200',
            subtext: 'text-emerald-600',
            label: 'text-emerald-200',
        };
    }

    if (rating >= 7.0) {
        return {
            card: 'bg-blue-950/40 border-blue-200',
            text: 'text-blue-200',
            subtext: 'text-blue-600',
            label: 'text-blue-200',
        };
    }

    if (rating >= 6.0) {
        return {
            card: 'bg-amber-950/40 border-amber-200',
            text: 'text-amber-200',
            subtext: 'text-amber-600',
            label: 'text-amber-200',
        };
    }

    return {
        card: 'bg-red-950/40 border-red-200',
        text: 'text-red-200',
        subtext: 'text-destructive',
        label: 'text-red-200',
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
                <div className="relative border-b border-border bg-card p-6">
                    <DialogHeader className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                        <div className="relative shrink-0">
                            <div className="rounded-full bg-card p-1 shadow-lg ring-2 ring-border-subtle">
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
                                    <AvatarFallback className="bg-secondary text-xl font-bold text-foreground">
                                        {getInitials(player.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <span className="absolute -right-1 -bottom-1 flex min-w-7 items-center justify-center rounded-full border-2 border-white bg-secondary px-1.5 text-xs font-bold text-foreground shadow-md">
                                {player.number ?? '-'}
                            </span>
                        </div>

                        <div className="min-w-0">
                            <DialogTitle className="text-xl font-bold text-foreground">
                                {player.name}
                            </DialogTitle>
                            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                                <span className="text-sm font-semibold text-muted-foreground">
                                    {teamName}
                                </span>
                                <span className="text-muted-foreground">·</span>
                                <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                                    {formatLineupPositionLabel(player.position)}
                                </span>
                                {player.isCaptain ? (
                                    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-bold text-foreground">
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
                                <div className="h-4 w-1 rounded-full bg-border-strong" />
                                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Match performance
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {rating !== null &&
                                ratingStyles &&
                                ratingLabel !== null ? (
                                    <RatingStatCard
                                        rating={rating}
                                        ratingLabel={ratingLabel}
                                        ratingStyles={ratingStyles}
                                    />
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
                                                    'border-t border-border pt-5',
                                            )}
                                        >
                                            <div className="mb-3 flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        'h-4 w-1 rounded-full',
                                                        config.accentColor,
                                                    )}
                                                />
                                                <h4 className="text-sm font-bold text-foreground">
                                                    {config.title}
                                                </h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                {items.map((stat) => (
                                                    <SecondaryStatCard
                                                        key={stat.label}
                                                        label={stat.label}
                                                        value={formatStatValue(
                                                            stat.value,
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-border bg-muted px-4 py-3 text-center">
                                <p className="text-sm text-muted-foreground">
                                    No detailed match statistics available yet.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="border-t border-border px-6 py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            No match statistics available.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
