import { Info } from 'lucide-react';

interface Props {
    message: string;
}

export default function MatchDataEmptyState({ message }: Props) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
            <span className="flex size-10 items-center justify-center rounded-full bg-white text-cyan-600 ring-1 ring-slate-200">
                <Info className="size-4" />
            </span>
            <p className="max-w-md">{message}</p>
        </div>
    );
}
