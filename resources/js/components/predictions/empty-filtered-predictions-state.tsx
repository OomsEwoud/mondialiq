import { X } from 'lucide-react';

interface Props {
    onClear: () => void;
}

export default function EmptyFilteredPredictionsState({ onClear }: Props) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-8 text-center shadow-sm shadow-blue-950/5 backdrop-blur">
            <p className="text-xs font-black tracking-[0.18em] text-cyan-700 uppercase">
                Filtered view
            </p>
            <h2 className="text-lg font-black text-slate-950">
                No predictions match your filters.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Try clearing filters or searching another team.
            </p>
            <button
                type="button"
                onClick={onClear}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
                <X className="size-4" />
                Clear filters
            </button>
        </section>
    );
}
