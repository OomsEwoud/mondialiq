
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
        return 'bg-emerald-100 text-emerald-700';
    }

    if (rating >= 7.0) {
        return 'bg-blue-100 text-blue-700';
    }

    if (rating >= 6.0) {
        return 'bg-amber-100 text-amber-700';
    }

    return 'bg-red-100 text-red-700';
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
                    'flex min-w-0 items-center gap-2.5 rounded-md border bg-white px-2.5 shadow-xs transition-colors',
                    isStarting
                        ? 'border-blue-100 py-2.5'
                        : 'border-slate-100 bg-white/80 py-1.5 shadow-none',
                    hasStats &&
                        'cursor-pointer hover:bg-slate-50 hover:ring-1 hover:ring-slate-200 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none',
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
                            'border border-white shadow-sm ring-1 ring-slate-200',
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
                        <AvatarFallback className="bg-blue-950 text-xs font-bold text-white">
                            {getInitials(player.name)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="absolute -right-1 -bottom-1 flex min-w-5 items-center justify-center rounded-full border border-white bg-slate-900 px-1 text-xs font-bold text-white shadow-sm">
                        {player.number ?? '-'}
                    </span>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                        <span
                            className="min-w-0 truncate text-sm font-bold text-slate-800"
                            title={player.name}
                        >
                            {player.name}
                        </span>
                        {player.isCaptain ? (
                            <span
                                className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-950 text-xs font-bold text-white"
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
                                    ? 'bg-slate-100 text-slate-500'
                                    : 'bg-slate-50 text-slate-400',
                            )}
                        >
                            <span className="truncate">
                                {formatLineupPositionLabel(player.position)}
                            </span>
                        </span>
                        {minutes !== null && minutes !== undefined ? (
                            <span className="text-xs font-medium text-slate-400">
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
