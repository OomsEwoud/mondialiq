interface Props {
    message: string;
}

export default function SquadEmptyState({ message }: Props) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-6 text-sm font-medium text-slate-500 shadow-sm">
            {message}
        </div>
    );
}
