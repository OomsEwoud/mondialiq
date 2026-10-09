import { Activity } from 'lucide-react';

export default function PlayerSeasonEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 border-t border-border-subtle px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-md bg-brand-subtle text-primary">
                <Activity className="size-6" />
            </span>
            <div>
                <p className="text-base font-bold text-foreground">
                    Nog geen seizoensstatistieken
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-text-muted">
                    Er zijn nog geen seizoensgegevens beschikbaar voor deze
                    speler.
                </p>
            </div>
        </div>
    );
}
