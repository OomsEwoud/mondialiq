import { useState } from 'react';
import MatchLineupPlayerModal from '@/components/matches/details/match-lineup-player-modal';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';

import type { MatchDetailsLineupPlayer } from '@/types/match-details';
import { formatLineupPositionLabel } from '@/utils/match-lineup';

type Props = {
    player: MatchDetailsLineupPlayer;
    teamName: string;
    isStarting: boolean;
};

function getRatingColorClass(rating: number): string {
    if (rating >= 8.0) {
        return 'bg-emerald-950/40 text-emerald-200';
    }

    if (rating >= 7.0) {
        return 'bg-blue-950/40 text-blue-200';
    }

    if (rating >= 6.0) {
        return 'bg-amber-950/40 text-amber-200';
    }

    return 'bg-red-950/40 text-red-200';
}

export default function MatchLineupPlayerItem({
    player,
    teamName,
    isStarting,
}: Props) {
    const getInitials = useInitials();
    const [modalOpen, setModalOpen] = useState(false);
    const hasStats = player.stats !== null;
    const rating = player.stats?.rating ?? null;
    const minutes = player.stats?.minutes ?? null;

    return (
        <>
            <div
                className={cn(
                    'flex min-w-0 items-center gap-2.5 rounded-md border bg-card px-2.5 shadow-xs transition-colors',
                    isStarting
                        ? 'border-blue-100 py-2.5'
                        : 'border-border bg-card/80 py-1.5 shadow-none',
                    hasStats &&
                        'cursor-pointer hover:bg-muted hover:ring-1 hover:ring-border focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none',
                )}
                onClick={() => {
                    if (hasStats) {
                        setModalOpen(true);
                    }
                }}
                role={hasStats ? 'button' : undefined}
                tabIndex={hasStats ? 0 : undefined}
                onKeyDown={
                    hasStats
                        ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setModalOpen(true);
                              }
                          }
                        : undefined
                }
                aria-label={
                    hasStats
                        ? `View ${player.name} match statistics`
                        : undefined
                }
            >
                <div className="relative shrink-0">
                    <Avatar
                        className={cn(
                            'border border-white shadow-sm ring-1 ring-border',
                            isStarting ? 'size-10' : 'size-9',
                        )}
                    >
                        {player.photo ? (
                            <AvatarImage
                                src={player.photo}
                                alt={`${player.name} photo`}
                                className="object-cover"
                            />
                        ) : null}
                        <AvatarFallback className="bg-secondary text-xs font-bold text-white">
                            {getInitials(player.name)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="absolute -right-1 -bottom-1 flex min-w-5 items-center justify-center rounded-full border border-white bg-secondary px-1 text-xs font-bold text-white shadow-sm">
                        {player.number ?? '-'}
                    </span>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                        <span
                            className="min-w-0 truncate text-sm font-bold text-foreground"
                            title={player.name}
                        >
                            {player.name}
                        </span>
                        {player.isCaptain ? (
                            <span
                                className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white"
                                title="Captain"
                                aria-label="Captain"
                            >
                                C
                            </span>
                        ) : null}
                        {rating !== null && rating !== undefined ? (
                            <span
                                className={cn(
                                    'flex shrink-0 items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-bold',
                                    getRatingColorClass(rating),
                                )}
                            >
                                {rating.toFixed(1)}
                            </span>
                        ) : null}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                        <span
                            className={cn(
                                'inline-flex max-w-full rounded-full px-2 py-0.5 text-xs font-bold',
                                isStarting
                                    ? 'bg-muted text-muted-foreground'
                                    : 'bg-muted text-muted-foreground',
                            )}
                        >
                            <span className="truncate">
                                {formatLineupPositionLabel(player.position)}
                            </span>
                        </span>
                        {minutes !== null && minutes !== undefined ? (
                            <span className="text-xs font-medium text-muted-foreground">
                                {minutes} min
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>

            {hasStats ? (
                <MatchLineupPlayerModal
                    player={player}
                    teamName={teamName}
                    isStarting={isStarting}
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                />
            ) : null}
        </>
    );
}
