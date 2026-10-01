import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import type { MatchDetailsEvent } from '@/types/match-details';

interface Props {
    event: MatchDetailsEvent;
}

export default function MatchEventRow({ event }: Props) {
    const minute = event.extraTime
        ? `${event.minute}+${event.extraTime}'`
        : `${event.minute}'`;
    const eventContext =
        [event.player, event.assist ? `Assist: ${event.assist}` : null]
            .filter(Boolean)
            .join(' · ') || event.team;

    return (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
            <span className="w-12 shrink-0 text-sm font-bold text-muted-foreground">
                {minute}
            </span>
            <ImageWithFallback
                src={event.teamLogo}
                alt={event.team}
                className="h-7 w-7 shrink-0 object-contain"
            />
            <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">
                    {event.detail}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                    {eventContext}
                </p>
            </div>
        </div>
    );
}
