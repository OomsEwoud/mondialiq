interface Props {
    message: string;
}

export default function SquadEmptyState({ message }: Props) {
    return (
        <div className="rounded-lg border border-dashed border-border-strong bg-surface p-6 text-sm font-medium text-text-muted">
            {message}
        </div>
    );
}
