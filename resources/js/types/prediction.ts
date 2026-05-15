import type { PredictionTab } from '@/components/predictions/prediction-tabs';
import type { Match } from '@/types/match';

export interface PredictionPageProps {
    fixtures: {
        data: Match[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    mode: PredictionTab;
}
