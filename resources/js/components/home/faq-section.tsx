import { ChevronDown } from 'lucide-react';

const faqs = [
    [
        'Is MondialiQ gratis?',
        'Ja. Je kunt gratis wedstrijden, AI-voorspellingen en analyses bekijken voor de ondersteunde competities.',
    ],
    [
        'Welke competities zijn beschikbaar?',
        'MondialiQ volgt 13 competities, waaronder de Jupiler Pro League, Premier League, Champions League, La Liga, Bundesliga en Serie A.',
    ],
    [
        'Hoe worden de AI-voorspellingen gemaakt?',
        'MondialiQ combineert beschikbare wedstrijddata, recente vorm en statistische patronen om een verwachte uitslag en kansverdeling te berekenen.',
    ],
    [
        'Hoe betrouwbaar zijn de voorspellingen?',
        'Elke voorspelling is een waarschijnlijkheidsinschatting, geen zekerheid. De confidence helpt je de modelverwachting in de juiste context te lezen.',
    ],
    [
        'Kan ik mijn favoriete clubs volgen?',
        'MondialiQ is ingericht om competities, clubs en relevante wedstrijden doorheen het seizoen overzichtelijk te volgen.',
    ],
    [
        'Kan ik ook mijn eigen voorspelling maken?',
        'Eigen voorspellingen blijven een secundaire mogelijkheid waarmee je jouw voetbalgevoel kunt vergelijken met de AI-analyse.',
    ],
] as const;

export default function FaqSection() {
    return (
        <section className="border-t border-[#262c29] bg-[#0e1210] px-5 py-20 sm:px-8 sm:py-28">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
                <header>
                    <p className="text-xs font-semibold tracking-[0.18em] text-[#6fae88] uppercase">
                        FAQ
                    </p>
                    <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                        Veelgestelde vragen
                    </h2>
                </header>
                <div className="border-t border-[#303732]">
                    {faqs.map(([question, answer]) => (
                        <details
                            key={question}
                            className="group border-b border-[#303732]"
                        >
                            <summary className="flex min-h-20 list-none items-center justify-between gap-5 py-5 text-left font-semibold text-[#e1e3df] transition outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[#36a96b] focus-visible:ring-inset [&::-webkit-details-marker]:hidden">
                                {question}
                                <ChevronDown
                                    aria-hidden="true"
                                    className="size-5 shrink-0 text-[#68706b] transition-transform duration-200 group-open:rotate-180"
                                />
                            </summary>
                            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 group-open:grid-rows-[1fr]">
                                <div className="overflow-hidden">
                                    <p className="max-w-2xl pb-6 text-sm leading-7 text-[#949d97]">
                                        {answer}
                                    </p>
                                </div>
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
