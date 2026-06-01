const infoItems = [
    {
        title: 'AI Predictions',
        description:
            'Model prediction based on match data, market signals and team context.',
        metric: '01',
    },
    {
        title: 'Your Predictions',
        description: 'Lock in your own score, winner and confidence.',
        metric: '02',
    },
    {
        title: 'Compare',
        description:
            'See where your football instinct matches or differs from the model.',
        metric: '03',
    },
];

export default function PredictionInfoGrid() {
    return (
        <section className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            {infoItems.map((item) => (
                <article
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-blue-950/5 backdrop-blur"
                >
                    <p className="mb-3 text-xs font-black tracking-[0.2em] text-cyan-700 uppercase">
                        {item.metric}
                    </p>
                    <h2 className="text-base font-black text-blue-950">
                        {item.title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.description}
                    </p>
                </article>
            ))}
        </section>
    );
}
