import { Sparkles } from 'lucide-react';
import type { PlayerDetailsSeasonStat } from '@/types/player-details';

export default function PlayerInsight({
    stats,
}: {
    stats: PlayerDetailsSeasonStat;
}) {
    if (
        stats.minutes === null ||
        stats.minutes <= 0 ||
        stats.goals === null ||
        stats.assists === null ||
        stats.goals + stats.assists === 0
    ) {
        return null;
    }

    return (
        <aside className="flex gap-3 border-l-2 border-primary pl-4">
            <Sparkles
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
            />
            <div>
                <h3 className="text-sm font-semibold text-primary">
                    Seizoensinzicht
                </h3>
                <p className="mt-1 text-sm leading-6 text-text-secondary">
                    Direct betrokken bij {stats.goals + stats.assists}{' '}
                    doelpunten: {stats.goals} gescoord en {stats.assists}{' '}
                    assists in {stats.minutes.toLocaleString('nl-NL')} minuten.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Samenvatting van de geregistreerde seizoenscijfers.
                </p>
            </div>
        </aside>
    );
}
