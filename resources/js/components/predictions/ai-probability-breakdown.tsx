import { BarChart3 } from 'lucide-react';
import AiProbabilityCard from '@/components/predictions/ai-probability-card';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function AiProbabilityBreakdown({ match }: Props) {
    const probabilities = match.prediction
        ? [
              {
                  label: `${match.homeTeamShort} win`,
                  value: match.prediction.homeWin,
                  tone: 'home' as const,
              },
              {
                  label: 'Draw',
                  value: match.prediction.draw,
                  tone: 'draw' as const,
              },
              {
                  label: `${match.awayTeamShort} win`,
                  value: match.prediction.awayWin,
                  tone: 'away' as const,
              },
          ]
        : [];
    const highestValue = Math.max(...probabilities.map((p) => p.value ?? -1));

    if (probabilities.length === 0) {
        return null;
    }

    return (
        <section className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-white">
                    <BarChart3 className="size-5" />
                </span>
                <div>
                    <h2 className="text-xl font-bold text-foreground">
                        Probability breakdown
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Estimated outcome chances
                    </p>
                </div>
            </div>

            <div className="mt-5 grid gap-3">
                {probabilities.map((probability) => (
                    <AiProbabilityCard
                        key={probability.label}
                        label={probability.label}
                        value={probability.value}
                        tone={probability.tone}
                        isHighest={
                            probability.value !== null &&
                            probability.value === highestValue
                        }
                    />
                ))}
            </div>
        </section>
    );
}
