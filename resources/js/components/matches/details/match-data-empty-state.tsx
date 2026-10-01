import { Info } from 'lucide-react';

interface Props {
    message: string;
}

export default function MatchDataEmptyState({ message }: Props) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-gradient-to-b from-card to-card/60 px-4 py-10 text-center text-sm font-medium text-muted-foreground">
            <span className="flex size-11 items-center justify-center rounded-full bg-card text-primary shadow-sm ring-1 ring-border">
                <Info className="size-4" />
            </span>
            <p className="max-w-md leading-6">{message}</p>
        </div>
    );
}
