import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { MatchDetailsMissingPlayer } from '@/types/match-details';

interface Props {
    player: MatchDetailsMissingPlayer;
}

export default function MatchMissingPlayerRow({ player }: Props) {
    const getInitials = useInitials();
    const typeLabel = formatMissingPlayerType(player.type);
    const reason = formatMissingPlayerReason(player.reason);
    const meta = [formatPlayerMeta(player), reason].filter(Boolean).join(' - ');

    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-xs">
            <Avatar className="size-10 border border-white shadow-sm ring-1 ring-slate-200">
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

            <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                    <p
                        className="min-w-0 truncate text-sm font-black text-slate-800"
                        title={player.name}
                    >
                        {player.name}
                    </p>
                    <span
                        className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black',
                            typeLabel === 'Questionable'
                                ? 'bg-cyan-50 text-cyan-700'
                                : 'bg-amber-50 text-amber-700',
                        )}
                    >
                        {typeLabel}
                    </span>
                </div>
                <p className="mt-1 truncate text-xs font-medium text-slate-500">
                    {meta || 'Reason not available'}
                </p>
            </div>
        </div>
    );
}

function formatMissingPlayerType(type: string | null): string {
    const normalizedType = type?.toLowerCase() ?? '';

    if (['questionable', 'doubtful'].includes(normalizedType)) {
        return 'Questionable';
    }

    return 'Missing';
}

function formatMissingPlayerReason(reason: string | null): string | null {
    const trimmedReason = reason?.trim();

    return trimmedReason === '' ? null : (trimmedReason ?? null);
}

function formatPlayerMeta(player: MatchDetailsMissingPlayer): string | null {
    const details = [
        player.number ? `#${player.number}` : null,
        player.position,
        player.country,
    ].filter(Boolean);

    return details.length > 0 ? details.join(' - ') : null;
}
