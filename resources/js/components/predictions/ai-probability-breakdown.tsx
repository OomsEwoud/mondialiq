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

    if (probabilities.length === 0) {
        return null;
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-black text-blue-950">
                        Probability breakdown
                    </h2>
                    <p className="text-xs font-medium text-slate-500">
                        Estimated outcome chances, not certainties.
                    </p>
                </div>
                <BarChart3 className="size-5 text-cyan-500" />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
                {probabilities.map((probability) => (
                    <AiProbabilityCard
                        key={probability.label}
                        label={probability.label}
                        value={probability.value}
                        tone={probability.tone}
                    />
                ))}
            </div>
        </section>
    );
}
