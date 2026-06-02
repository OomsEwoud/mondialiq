import { Info } from 'lucide-react';

interface Props {
    message: string;
}

export default function MatchDataEmptyState({ message }: Props) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-[1.7rem] border border-dashed border-cyan-100 bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,0.96))] px-4 py-10 text-center text-sm font-medium text-slate-500">
            <span className="flex size-11 items-center justify-center rounded-full bg-white text-cyan-700 ring-1 ring-cyan-100 shadow-sm shadow-cyan-950/5">
                <Info className="size-4" />
            </span>
            <p className="max-w-md leading-6">{message}</p>
        </div>
    );
}
