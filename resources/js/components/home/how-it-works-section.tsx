const steps = [
    [
        '01',
        'Kies je competities',
        'Volg de leagues, clubs en wedstrijden die voor jou belangrijk zijn.',
    ],
    [
        '02',
        'Bekijk de AI-voorspelling',
        'Zie de verwachte score, winstkansen, expected goals en modelconfidence.',
    ],
    [
        '03',
        'Begrijp waarom',
        'Ontdek welke vorm, statistieken en wedstrijdpatronen de verwachting ondersteunen.',
    ],
] as const;

export default function HowItWorksSection() {
    return (
        <section className="px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
            <div className="mx-auto max-w-7xl">
                <header className="max-w-2xl">
                    <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                        Van data naar inzicht
                    </p>
                    <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                        Meer dan een scorevoorspelling
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        MondialiQ maakt complexe wedstrijddata snel
                        begrijpelijk.
                    </p>
                </header>
                <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border-subtle bg-border-subtle lg:grid-cols-3">
                    {steps.map(([number, title, description]) => (
                        <article
                            key={number}
                            className="group relative min-h-72 bg-surface p-7 transition hover:bg-surface-interactive sm:p-9"
                        >
                            <span className="text-6xl leading-none font-black tracking-[-0.06em] text-[#252c28] transition group-hover:text-[#2b352f] sm:text-7xl">
                                {number}
                            </span>
                            <div className="mt-14">
                                <h3 className="text-xl font-bold text-foreground">
                                    {title}
                                </h3>
                                <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
