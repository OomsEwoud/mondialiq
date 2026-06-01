interface Props {
    message: string;
}

export default function SquadEmptyState({ message }: Props) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-medium text-slate-500">
            {message}
        </div>
    );
}
