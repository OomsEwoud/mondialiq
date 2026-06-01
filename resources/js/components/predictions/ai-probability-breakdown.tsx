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
    const highestValue = Math.max(
        ...probabilities.map((probability) => probability.value ?? -1),
    );

    if (probabilities.length === 0) {
        return null;
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-black text-blue-950">
                        Probability breakdown
                    </h2>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                        Estimated outcome chances, not certainties.
                    </p>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <BarChart3 className="size-5" />
                </span>
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
