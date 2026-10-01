import { Link } from '@inertiajs/react';
import { CalendarDays, Calculator } from 'lucide-react';
import PageHeader from '@/components/typography/page-header';
import { Button } from '@/components/ui/forms/button';
import { matches } from '@/routes';

interface Props {
    scoringGuideHref: string;
}

export default function PredictionPageHeader({ scoringGuideHref }: Props) {
    return (
        <PageHeader
            eyebrow="Voor de aftrap"
            title="Voorspellingen"
            description="Vergelijk de analyse met jouw eigen keuze. Volg je voorspellingen en bekijk hoe je punten scoort."
            actions={
                <>
                    <Button asChild>
                        <Link href={matches()}>
                            <CalendarDays />
                            Kies een wedstrijd
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={scoringGuideHref}>
                            <Calculator />
                            Puntentelling
                        </Link>
                    </Button>
                </>
            }
        />
    );
}
