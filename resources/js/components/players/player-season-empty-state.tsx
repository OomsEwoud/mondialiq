import { Activity } from 'lucide-react';

export default function PlayerSeasonEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border-strong bg-surface px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-md bg-brand-subtle text-primary">
                <Activity className="size-6" />
            </span>
            <div>
                <p className="text-base font-bold text-foreground">
                    Nog geen seizoensstatistieken
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-text-muted">
                    Zodra deze speler wedstrijdminuten maakt, verschijnen hier
                    de prestaties en kerncijfers.
                </p>
            </div>
        </div>
    );
}
