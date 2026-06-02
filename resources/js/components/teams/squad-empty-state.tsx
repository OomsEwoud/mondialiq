interface Props {
    message: string;
}

export default function SquadEmptyState({ message }: Props) {
    return (
        <div className="rounded-[1.5rem] border border-dashed border-cyan-100 bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,0.96))] p-6 text-sm font-medium text-slate-500 shadow-sm shadow-cyan-950/5">
            {message}
        </div>
    );
}
