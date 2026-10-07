import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import PageHeader from '@/components/typography/page-header';
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
        <PageHeader
            variant="top-level"
            eyebrow={isPersonal ? 'Jouw keuzes' : 'AI-analyses'}
            title={isPersonal ? 'Mijn voorspellingen' : 'Voorspellingen'}
            description={
                isPersonal
                    ? 'Volg je eigen keuzes en bekijk de resultaten.'
                    : 'Bekijk wat het model verwacht vóór de aftrap.'
            }
            actions={
                <nav
                    aria-label="Meer over voorspellingen"
                    className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2"
                >
                    <Link
                        href={predictions({
                            query: { mode: isPersonal ? 'ai' : 'mine' },
                        })}
                        className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium text-text-secondary transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        {isPersonal
                            ? 'Bekijk AI-analyses'
                            : 'Mijn voorspellingen'}
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    {isPersonal && (
                        <Link
                            href={scoringGuideHref}
                            className="inline-flex min-h-11 items-center rounded-sm text-xs text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                            Puntentelling
                        </Link>
                    )}
                </nav>
            }
        />
    );
}
