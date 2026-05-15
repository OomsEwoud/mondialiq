import { Sparkles } from 'lucide-react';

export default function PredictionPageHeader() {
    return (
        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm sm:mb-8 sm:p-8">
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 sm:size-12">
                <Sparkles size={22} />
            </div>
            <p className="text-xs font-bold text-cyan-600 uppercase">
                AI Match Insights
            </p>
            <h1 className="mt-1 text-3xl font-black text-blue-950 sm:text-4xl md:text-5xl">
                Predictions
            </h1>
        </section>
    );
}
