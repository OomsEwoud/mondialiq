import { CheckCircle2, LineChart, Scale } from 'lucide-react';

const reports = [
    { label: 'Correct resultaat', value: '64%', width: '64%' },
    { label: 'Binnen één goal', value: '78%', width: '78%' },
    { label: 'Hoge confidence', value: '71%', width: '71%' },
] as const;

export default function AccuracySection() {
    return (
        <section
            id="resultaten"
            className="border-t border-[#262c29] bg-[#0e1210] px-5 py-20 sm:px-8 sm:py-28"
        >
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
                <div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-[#6fae88] uppercase">
                        Modeltransparantie
                    </p>
                    <h2 className="mt-4 text-3xl leading-tight font-black tracking-[-0.035em] sm:text-5xl">
                        Voorspellen én terugkijken.
                    </h2>
                    <p className="mt-5 max-w-xl text-base leading-7 text-[#949d97]">
                        Na de wedstrijd wordt de verwachting naast de echte
                        uitslag gelegd. Zo zie je niet alleen wat het model
                        verwachtte, maar ook hoe het doorheen het seizoen
                        presteert.
                    </p>
                    <div className="mt-8 space-y-4">
                        <Principle
                            icon={CheckCircle2}
                            title="Resultaten gecontroleerd"
                            text="Elke gespeelde wedstrijd telt mee in de rapportage."
                        />
                        <Principle
                            icon={Scale}
                            title="Confidence in context"
                            text="Hoge en lage modelzekerheid worden afzonderlijk geëvalueerd."
                        />
                        <Principle
                            icon={LineChart}
                            title="Per competitie gevolgd"
                            text="Performance blijft inzichtelijk per league en periode."
                        />
                    </div>
                </div>
                <div className="rounded-2xl border border-[#303732] bg-[#111513] p-5 sm:p-8">
                    <div className="flex items-start justify-between gap-5 border-b border-[#262c29] pb-6">
                        <div>
                            <span className="text-[0.65rem] font-semibold tracking-[0.14em] text-[#68706b] uppercase">
                                Voorbeeldweergave · demonstratiedata
                            </span>
                            <h3 className="mt-2 text-xl font-bold text-white">
                                Modelrapport · laatste 200 matches
                            </h3>
                        </div>
                        <span className="rounded-lg border border-[#303732] bg-[#171c19] px-2.5 py-1.5 text-xs font-semibold text-[#949d97]">
                            Alle leagues
                        </span>
                    </div>
                    <div className="mt-7 space-y-6">
                        {reports.map((report) => (
                            <div key={report.label}>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#aeb5b0]">
                                        {report.label}
                                    </span>
                                    <strong className="text-[#e3e5e1]">
                                        {report.value}
                                    </strong>
                                </div>
                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#242a27]">
                                    <div
                                        className="h-full rounded-full bg-[#57ad78]"
                                        style={{ width: report.width }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-7 border-t border-[#262c29] pt-5 text-xs leading-5 text-[#68706b]">
                        Deze cijfers tonen uitsluitend hoe de rapportage wordt
                        gepresenteerd en zijn geen actuele performanceclaim.
                    </p>
                </div>
            </div>
        </section>
    );
}

function Principle({
    icon: Icon,
    title,
    text,
}: {
    icon: typeof CheckCircle2;
    title: string;
    text: string;
}) {
    return (
        <div className="flex gap-3">
            <Icon
                className="mt-0.5 size-4 shrink-0 text-[#6fae88]"
                aria-hidden="true"
            />
            <div>
                <strong className="text-sm text-[#daddd9]">{title}</strong>
                <p className="mt-1 text-sm leading-6 text-[#7f8882]">{text}</p>
            </div>
        </div>
    );
}
