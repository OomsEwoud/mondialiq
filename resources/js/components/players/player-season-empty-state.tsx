import { Activity } from 'lucide-react';

export default function PlayerSeasonEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#343d37] bg-[#0d110f] px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-md bg-[#1b2b21] text-[#70b98e]">
                <Activity className="size-6" />
            </span>
            <div>
                <p className="text-base font-bold text-[#f3f4f1]">
                    Nog geen seizoensstatistieken
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#7f8882]">
                    Zodra deze speler wedstrijdminuten maakt, verschijnen hier
                    de prestaties en kerncijfers.
                </p>
            </div>
        </div>
    );
}
