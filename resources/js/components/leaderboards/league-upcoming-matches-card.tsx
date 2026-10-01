import { CalendarClock, Zap } from 'lucide-react';
import { useState } from 'react';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import type { Match } from '@/types/match';

interface Props {
    canPredict?: boolean;
    fixtures: Match[];
    scoreboardId: number;
    boostsRemaining: number | null;
    boostsLimit: number | null;
    boostedConfidenceThreshold?: string | null;
    boostedEnabled: boolean;
}

export default function LeagueUpcomingMatchesCard({
    canPredict = true,
    fixtures,
    scoreboardId,
    boostsRemaining,
    boostsLimit,
    boostedConfidenceThreshold,
    boostedEnabled,
}: Props) {
    const [openModalId, setOpenModalId] = useState<number | null>(null);
    const openFixture = fixtures.find((f) => f.id === openModalId);

    return (
        <Card className="rounded-2xl border-border bg-card shadow-sm">
            <CardHeader className="gap-2 px-5 py-5">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClock className="size-4" />
                    <p className="text-xs font-semibold tracking-wide uppercase">
                        Upcoming matches
                    </p>
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">
                    Predict & earn points
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                {fixtures.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted px-4 py-8 text-center">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-muted-foreground">
                            <CalendarClock className="size-5" />
                        </span>
                        <p className="mt-3 text-sm font-semibold text-foreground">
                            No upcoming matches
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Check back later for new fixtures.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {fixtures.map((match) => (
                            <div
                                key={match.id}
                                className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex min-w-0 flex-row items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <ImageWithFallback
                                                src={match.homeTeamLogo}
                                                alt={match.homeTeam}
                                                className="size-7 shrink-0 rounded-full bg-card object-contain ring-1 ring-border"
                                            />
                                            <span className="min-w-0 truncate text-sm font-bold text-foreground">
                                                {match.homeTeamShort}
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-muted-foreground">
                                            vs
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <ImageWithFallback
                                                src={match.awayTeamLogo}
                                                alt={match.awayTeam}
                                                className="size-7 shrink-0 rounded-full bg-card object-contain ring-1 ring-border"
                                            />
                                            <span className="min-w-0 truncate text-sm font-bold text-foreground">
                                                {match.awayTeamShort}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                                        {match.date} {match.time}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={!canPredict}
                                        onClick={() => setOpenModalId(match.id)}
                                        className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-secondary px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {match.userPrediction ? (
                                            <>
                                                <Zap className="size-3.5" />
                                                Edit prediction
                                            </>
                                        ) : boostedEnabled ? (
                                            <>
                                                <Zap className="size-3.5" />
                                                Predict & boost
                                            </>
                                        ) : (
                                            'Predict'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {openFixture && (
                <UserPredictionModal
                    match={openFixture}
                    open={openModalId !== null}
                    onOpenChange={(open) =>
                        setOpenModalId(open ? openFixture.id : null)
                    }
                    scoreboardId={scoreboardId}
                    boostsRemaining={boostsRemaining}
                    boostsLimit={boostsLimit}
                    boostedConfidenceThreshold={boostedConfidenceThreshold}
                />
            )}
        </Card>
    );
}
