import { Link } from '@inertiajs/react';
import PageHead from '@/components/seo/page-head';
import PredictionPreferencesSection from '@/components/settings/prediction-preferences-section';
import { predictions } from '@/routes';
import type { PredictionPreferences } from '@/types';

export default function Preferences({
    predictionPreferences,
}: {
    predictionPreferences: PredictionPreferences;
}) {
    return (
        <div className="max-w-2xl">
            <PageHead
                title="Voorkeuren voor voorspellingen"
                description="Beheer de zichtbaarheid van je voorspellingen, klassementen en groepen."
                noIndex
            />
            <Link
                href={predictions({ query: { mode: 'mine' } })}
                className="inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground"
            >
                ← Mijn voorspellingen
            </Link>
            <header className="mt-4 mb-8">
                <h1 className="mq-page-title">Voorkeuren</h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Bepaal hoe je voorspellingen en deelname zichtbaar zijn voor
                    anderen.
                </p>
            </header>
            <PredictionPreferencesSection preferences={predictionPreferences} />
        </div>
    );
}
