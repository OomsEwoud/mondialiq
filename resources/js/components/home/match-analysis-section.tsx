import { Activity, CircleDot, Goal, ShieldCheck } from 'lucide-react';

const metrics = [
    {
        label: 'Thuisvorm',
        value: 'W · W · G · W · W',
        detail: '4W · 1G',
    },
    { label: 'Goals voor', value: '2.1', detail: 'gemiddeld thuis' },
    { label: 'Clean sheet', value: '41%', detail: 'modelkans' },
    { label: 'Beide scoren', value: '57%', detail: 'modelkans' },
] as const;

const factors = [
    ['Vorm', 'Arsenal presteert stabieler over de laatste vijf wedstrijden'],
    ['Aanval', 'Hogere kanscreatie en expected goals in thuiswedstrijden'],
    ['Verdediging', 'Liverpool geeft buitenshuis vaker grote kansen weg'],
] as const;

export default function MatchAnalysisSection() {
    return (
        <section
            id="analyse"
            className="scroll-mt-20 border-y border-[#262c29] bg-[#0e1210] px-5 py-20 sm:px-8 sm:py-28"
        >
            <div className="mx-auto max-w-7xl">
                <header className="grid gap-5 lg:grid-cols-2 lg:items-end">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.18em] text-[#6fae88] uppercase">
                            Dieper dan de uitslag
                        </p>
                        <h2 className="mt-4 max-w-2xl text-3xl leading-tight font-black tracking-[-0.035em] sm:text-5xl">
                            Elke voorspelling krijgt context.
                        </h2>
                    </div>
                    <p className="max-w-xl text-base leading-7 text-[#949d97] lg:justify-self-end">
                        MondialiQ brengt vorm, aanvalskracht en
                        wedstrijdpatronen samen in één rustig leesbare analyse.
                    </p>
                </header>
                <div className="mt-12 grid overflow-hidden rounded-2xl border border-[#303732] bg-[#111513] lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="p-5 sm:p-8 lg:p-10">
                        <div className="flex items-center justify-between gap-4 border-b border-[#262c29] pb-6">
                            <div>
                                <span className="text-[0.65rem] font-semibold tracking-[0.14em] text-[#68706b] uppercase">
                                    Premier League · Analyse
                                </span>
                                <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                                    Arsenal — Liverpool
                                </h3>
                            </div>
                            <span className="rounded-full border border-[#2b4636] bg-[#153024] px-3 py-1.5 text-xs font-semibold text-[#8bc5a1]">
                                68% confidence
                            </span>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {metrics.map((metric) => (
                                <div
                                    key={metric.label}
                                    className="min-h-28 rounded-xl border border-[#262c29] bg-[#141916] p-4"
                                >
                                    <span className="text-[0.65rem] font-semibold tracking-[0.1em] text-[#68706b] uppercase">
                                        {metric.label}
                                    </span>
                                    <strong className="mt-3 block text-lg font-bold text-[#e3e5e1]">
                                        {metric.value}
                                    </strong>
                                    <span className="mt-1 block text-xs text-[#68706b]">
                                        {metric.detail}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-7">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-[#aeb5b0]">
                                    Expected goals
                                </span>
                                <span className="text-[#68706b]">
                                    ARS 1.9 · LIV 1.2
                                </span>
                            </div>
                            <div className="mt-3 grid grid-cols-[1.9fr_1.2fr] gap-1">
                                <span className="h-2 rounded-l-full bg-[#57ad78]" />
                                <span className="h-2 rounded-r-full bg-[#39413c]" />
                            </div>
                        </div>
                    </div>
                    <aside className="border-t border-[#303732] bg-[#141916] p-5 sm:p-8 lg:border-t-0 lg:border-l lg:p-10">
                        <div className="flex size-10 items-center justify-center rounded-xl border border-[#2f3833] bg-[#1a211d] text-[#7fba95]">
                            <Activity className="size-4" aria-hidden="true" />
                        </div>
                        <h3 className="mt-6 text-xl font-bold text-white">
                            Wat weegt het zwaarst?
                        </h3>
                        <div className="mt-5 divide-y divide-[#2a302d]">
                            {factors.map(([label, description], index) => {
                                const icons = [CircleDot, Goal, ShieldCheck];
                                const Icon = icons[index];

                                return (
                                    <div
                                        key={label}
                                        className="flex gap-3 py-4 first:pt-0 last:pb-0"
                                    >
                                        <Icon
                                            className="mt-0.5 size-4 shrink-0 text-[#6fae88]"
                                            aria-hidden="true"
                                        />
                                        <div>
                                            <strong className="text-sm text-[#daddd9]">
                                                {label}
                                            </strong>
                                            <p className="mt-1 text-xs leading-5 text-[#7f8882]">
                                                {description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
