import { Link } from '@inertiajs/react';
import { CalendarDays, Clock, Sparkles, Trophy } from 'lucide-react';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import { show as showTeam } from '@/routes/teams';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function AiPredictionHero({ match }: Props) {
    return (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                    AI Prediction Report
                </p>
                <span className="inline-flex items-center gap-2 rounded-lg border border-cyan-800/50 bg-cyan-950/50 px-3 py-1.5 text-xs font-semibold text-primary">
                    Read-only AI analysis
                </span>
            </div>

            <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-6">
                <Link
                    href={showTeam.url(match.homeTeamId)}
                    className="group flex flex-col items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50"
                >
                    <ImageWithFallback
                        src={match.homeTeamLogo}
                        alt={match.homeTeam}
                        className="size-16 shrink-0 object-contain"
                    />
                    <span className="text-sm font-bold text-white group-hover:text-primary">
                        {match.homeTeamShort}
                    </span>
                </Link>

                <div className="text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/60 px-3 py-1 text-xs font-semibold text-primary">
                        <Sparkles className="size-3.5" />
                        AI Analysis
                    </span>
                    <p className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                        vs
                    </p>
                </div>

                <Link
                    href={showTeam.url(match.awayTeamId)}
                    className="group flex flex-col items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50"
                >
                    <ImageWithFallback
                        src={match.awayTeamLogo}
                        alt={match.awayTeam}
                        className="size-16 shrink-0 object-contain"
                    />
                    <span className="text-sm font-bold text-white group-hover:text-primary">
                        {match.awayTeamShort}
                    </span>
                </Link>
            </div>

            <h1 className="mt-5 text-center text-2xl font-bold text-white sm:text-3xl">
                {match.homeTeam} vs {match.awayTeam}
            </h1>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <Trophy className="size-3.5 text-primary" />
                    {match.round}
                </span>
                <span className="hidden text-muted-foreground sm:inline">
                    |
                </span>
                <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 text-primary" />
                    {match.date}
                </span>
                <span className="hidden text-muted-foreground sm:inline">
                    |
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" />
                    {match.time}
                </span>
            </div>
        </section>
    );
}
