import { Info } from 'lucide-react';

interface Props {
    message: string;
}

export default function MatchDataEmptyState({ message }: Props) {
    return (
        <div className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10 text-center text-sm text-muted-foreground">
            <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Info className="size-4" />
            </span>
            <p className="max-w-md leading-6">{message}</p>
        </div>
    );
}
