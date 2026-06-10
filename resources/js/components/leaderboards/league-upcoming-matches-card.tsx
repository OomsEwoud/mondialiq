import { CalendarClock, Zap } from 'lucide-react';
import { useState } from 'react';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import type { Match } from '@/types/match';

interface Props {
    fixtures: Match[];
    scoreboardId: number;
    boostsRemaining: number | null;
    boostsLimit: number | null;
    boostedConfidenceThreshold?: string | null;
    boostedEnabled: boolean;
}

export default function LeagueUpcomingMatchesCard({
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
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="gap-2 px-5 py-5">
                <div className="flex items-center gap-2 text-slate-600">
                    <CalendarClock className="size-4" />
                    <p className="text-xs font-semibold tracking-wide uppercase">
                        Upcoming matches
                    </p>
                </div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                    Predict & earn points
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                {fixtures.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-cyan-50 text-slate-500">
                            <CalendarClock className="size-5" />
                        </span>
                        <p className="mt-3 text-sm font-semibold text-slate-900">
                            No upcoming matches
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                            Check back later for new fixtures.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {fixtures.map((match) => (
                            <div
                                key={match.id}
                                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex min-w-0 flex-row items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={match.homeTeamLogo}
                                                alt={match.homeTeam}
                                                className="size-7 shrink-0 rounded-full bg-white object-contain ring-1 ring-slate-200"
                                            />
                                            <span className="min-w-0 truncate text-sm font-bold text-slate-900">
                                                {match.homeTeamShort}
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-400">
                                            vs
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={match.awayTeamLogo}
                                                alt={match.awayTeam}
                                                className="size-7 shrink-0 rounded-full bg-white object-contain ring-1 ring-slate-200"
                                            />
                                            <span className="min-w-0 truncate text-sm font-bold text-slate-900">
                                                {match.awayTeamShort}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                                        {match.date} {match.time}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setOpenModalId(match.id)}
                                        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
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
