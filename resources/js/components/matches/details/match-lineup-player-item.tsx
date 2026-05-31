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
    isStarting: boolean;
};

export default function MatchLineupPlayerItem({
    player,
    isStarting,
}: Props) {
    const getInitials = useInitials();

    return (
        <div
            className={cn(
                'flex min-w-0 items-center gap-2.5 rounded-md border bg-white px-2.5 shadow-xs',
                isStarting
                    ? 'border-blue-100 py-2.5'
                    : 'border-slate-100 bg-white/80 py-1.5 shadow-none',
            )}
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
                    <AvatarFallback className="bg-blue-950 text-[11px] font-black text-white">
                        {getInitials(player.name)}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute -right-1 -bottom-1 flex min-w-5 items-center justify-center rounded-full border border-white bg-slate-900 px-1 text-[10px] font-black text-white shadow-sm">
                    {player.number ?? '-'}
                </span>
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                    <p
                        className="min-w-0 truncate text-sm font-bold text-slate-800"
                        title={player.name}
                    >
                        {player.name}
                    </p>
                    {player.isCaptain ? (
                        <span
                            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-950 text-[10px] font-black text-white"
                            title="Captain"
                            aria-label="Captain"
                        >
                            C
                        </span>
                    ) : null}
                </div>
                <span
                    className={cn(
                        'mt-1 inline-flex max-w-full rounded-full px-2 py-0.5 text-[11px] font-bold',
                        isStarting
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-slate-50 text-slate-400',
                    )}
                >
                    <span className="truncate">
                        {formatLineupPositionLabel(player.position)}
                    </span>
                </span>
            </div>
        </div>
    );
}
