import { Bot, GitCompareArrows, UserRound } from 'lucide-react';

const infoItems = [
    {
        title: 'AI Predictions',
        description:
            'Model prediction based on match data, market signals and team context.',
        icon: Bot,
    },
    {
        title: 'Your Predictions',
        description: 'Lock in your own score, winner and confidence.',
        icon: UserRound,
    },
    {
        title: 'Compare',
        description:
            'See where your football instinct matches or differs from the model.',
        icon: GitCompareArrows,
    },
];

export default function PredictionInfoGrid() {
    return (
        <section className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            {infoItems.map((item) => (
                <article
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-950/5"
                >
                    <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                        <item.icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-sm font-black text-slate-950">
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
