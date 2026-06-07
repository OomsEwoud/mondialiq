import { X } from 'lucide-react';

interface Props {
    onClear: () => void;
}

export default function EmptyFilteredPredictionsState({ onClear }: Props) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                Filtered view
            </p>
            <h2 className="text-lg font-bold text-slate-900">
                No predictions match your filters.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Try clearing filters or searching another team.
            </p>
            <button
                type="button"
                onClick={onClear}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
                <X className="size-4" />
                Clear filters
            </button>
        </section>
    );
}
