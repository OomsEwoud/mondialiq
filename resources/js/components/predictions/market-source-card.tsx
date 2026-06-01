import PredictionSourceCard from '@/components/predictions/prediction-source-card';
import type { MarketOddsSummary } from '@/types/prediction';
import { formatProbability } from '@/utils/ai-prediction';
import { normalizeScoreLabel } from '@/utils/match-prediction';

interface Props {
    marketOdds: MarketOddsSummary;
}

export default function MarketSourceCard({ marketOdds }: Props) {
    return (
        <PredictionSourceCard
            title="Market signal"
            subtitle="Averaged bookmaker signal"
            rows={[
                [
                    'Home win',
                    formatProbability(marketOdds.home_win_probability),
                ],
                ['Draw', formatProbability(marketOdds.draw_probability)],
                [
                    'Away win',
                    formatProbability(marketOdds.away_win_probability),
                ],
                [
                    'Over 2.5',
                    formatProbability(marketOdds.over_2_5_probability),
                ],
                [
                    'Most likely score',
                    normalizeScoreLabel(marketOdds.most_likely_score) ??
                        'Not available',
                ],
            ]}
        />
    );
}
