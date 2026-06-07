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
                    className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm "
                >
                    <p className="mb-4 text-xs font-bold tracking-wide text-cyan-600 uppercase">
                        {item.metric}
                    </p>
                    <h2 className="text-xl font-bold text-slate-900">
                        {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.description}
                    </p>
                </article>
            ))}
        </section>
    );
}
