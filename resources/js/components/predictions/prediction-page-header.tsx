import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { predictions } from '@/routes';

interface Props {
    isPersonal: boolean;
    scoringGuideHref: string;
}

export default function PredictionPageHeader({
    isPersonal,
    scoringGuideHref,
}: Props) {
    return (
        <header className="mb-10 flex flex-col gap-5 border-b border-[#262c29] pb-8 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-[#6fae88] uppercase">
                    {isPersonal ? 'Jouw keuzes' : 'AI-analyses'}
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                    {isPersonal ? 'Mijn voorspellingen' : 'Voorspellingen'}
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#949d97]">
                    {isPersonal
                        ? 'Volg je eigen keuzes en bekijk de resultaten.'
                        : 'Bekijk wat het model verwacht vóór de aftrap.'}
                </p>
            </div>
            <nav
                aria-label="Meer over voorspellingen"
                className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2"
            >
                <Link
                    href={predictions({
                        query: { mode: isPersonal ? 'ai' : 'mine' },
                    })}
                    className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium text-[#b5bbb7] transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                >
                    {isPersonal ? 'Bekijk AI-analyses' : 'Mijn voorspellingen'}
                    <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                {isPersonal && (
                    <Link
                        href={scoringGuideHref}
                        className="inline-flex min-h-11 items-center rounded-sm text-xs text-[#949d97] hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                    >
                        Puntentelling
                    </Link>
                )}
            </nav>
        </header>
    );
}
