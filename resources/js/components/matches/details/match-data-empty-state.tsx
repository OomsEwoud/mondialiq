import { Info } from 'lucide-react';

interface Props {
    message: string;
}

export default function MatchDataEmptyState({ message }: Props) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-gradient-to-b from-white to-slate-50/60 px-4 py-10 text-center text-sm font-medium text-slate-500">
            <span className="flex size-11 items-center justify-center rounded-full bg-white text-cyan-700 ring-1 ring-slate-200 shadow-sm">
                <Info className="size-4" />
            </span>
            <p className="max-w-md leading-6">{message}</p>
        </div>
    );
}
