const competitions = [
    ['Jupiler Pro League', 'BE'],
    ['Premier League', 'EN'],
    ['Champions League', 'EU'],
    ['La Liga', 'ES'],
    ['Bundesliga', 'DE'],
    ['Serie A', 'IT'],
    ['Europa League', 'EU'],
    ['Ligue 1', 'FR'],
] as const;

export default function CompetitionsSection() {
    return (
        <section
            id="competities"
            className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28 lg:py-32"
        >
            <div className="mx-auto max-w-7xl">
                <header className="max-w-2xl">
                    <p className="text-xs font-semibold tracking-[0.18em] text-[#6fae88] uppercase">
                        Competities
                    </p>
                    <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                        13 competities, één platform
                    </h2>
                    <p className="mt-4 text-[#949d97]">
                        Van JPL tot Champions League — het hele seizoen lang
                    </p>
                </header>
                <div className="mt-12 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                    {competitions.map(([name, code]) => (
                        <div
                            key={name}
                            className="group flex min-h-24 items-center gap-4 rounded-xl border border-[#262c29] bg-[#111513] p-4 transition hover:-translate-y-0.5 hover:border-[#3a433e] hover:bg-[#141916] sm:p-5"
                        >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#303732] bg-[#171c19] text-[0.65rem] font-bold tracking-[0.12em] text-[#89918c]">
                                {code}
                            </span>
                            <span className="text-sm leading-5 font-semibold text-[#daddd9]">
                                {name}
                            </span>
                        </div>
                    ))}
                    <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-[#343b37] p-4 text-center text-sm font-semibold text-[#7f8882]">
                        + Meer binnenkort
                    </div>
                </div>
            </div>
        </section>
    );
}
