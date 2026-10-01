import { Link } from '@inertiajs/react';
import { Calculator, CalendarDays } from 'lucide-react';
import PageHeader from '@/components/typography/page-header';
import { Button } from '@/components/ui/forms/button';
import { matches } from '@/routes';

interface Props {
    scoringGuideHref: string;
}

export default function LeaderboardsPageHeader({ scoringGuideHref }: Props) {
    return (
        <PageHeader
            eyebrow="Speel mee"
            title="Ranglijsten"
            description="Volg je positie, vergelijk je voorspellingen en daag vrienden uit in je eigen competitie."
            actions={
                <>
                    <Button asChild>
                        <Link href={matches()}>
                            <CalendarDays />
                            Voorspel een wedstrijd
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
