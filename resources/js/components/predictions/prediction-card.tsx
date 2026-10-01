import { Link } from '@inertiajs/react';
import { CalendarDays, Clock, Trophy } from 'lucide-react';
import PredictionStatusAction from '@/components/predictions/prediction-status-action';
import type { PredictionTab } from '@/components/predictions/prediction-tabs';
import PredictionUserActions from '@/components/predictions/prediction-user-actions';
import UserPredictionSummary from '@/components/predictions/user-prediction-summary';
import TeamCrest from '@/components/ui/display/team-crest';
import { cn } from '@/lib/utils';
import { show as showUserPrediction } from '@/routes/predictions/user';
import { show as showTeam } from '@/routes/teams';
import type { Match } from '@/types/match';
import {
    aiPredictionScoreLabel,
    predictionScoreLabel,
} from '@/utils/match-prediction';

interface Props {
    match: Match;
    actionLabel: string;
    mode: PredictionTab;
    userId?: number;
}

export default function PredictionCard({
    match,
    actionLabel,
    mode,
    userId,
}: Props) {
    const isMine = mode === 'mine';
    const isUser = mode === 'user';
    const prediction =
        isMine || isUser ? match.userPrediction : match.aiPrediction;
    const rawScore =
        isMine || isUser
            ? predictionScoreLabel(match)
            : aiPredictionScoreLabel(match);
    const score = rawScore?.replace(/\s*-\s*/, ' - ');

    return (
        <article className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/70 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                    {isMine
                        ? 'Personal pick'
                        : isUser
                          ? 'User pick'
                          : 'AI pick'}
                </span>
                <UserPredictionSummary
                    match={match}
                    aiMode={!isMine && !isUser}
                />
            </div>

            <div className="flex flex-col gap-4 border-t border-border pt-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                        <Link
                            href={showTeam.url(match.homeTeamId)}
                            className="group flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
                        >
                            <TeamCrest
                                src={match.homeTeamLogo}
                                name={match.homeTeam}
                                className="size-10 shrink-0 object-contain"
                            />
                            <span
                                className={cn(
                                    'text-base font-bold text-foreground',
                                    isMine
                                        ? 'group-hover:text-primary'
                                        : 'group-hover:text-primary',
                                )}
                            >
                                {match.homeTeamShort}
                            </span>
                        </Link>
                        {score ? (
                            <span className="rounded-lg border border-border bg-muted px-2.5 py-1 text-sm font-bold whitespace-nowrap text-foreground shadow-sm">
                                {score}
                            </span>
                        ) : (
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                vs
                            </span>
                        )}
                        <Link
                            href={showTeam.url(match.awayTeamId)}
                            className="group flex min-w-0 flex-row-reverse items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
                        >
                            <TeamCrest
                                src={match.awayTeamLogo}
                                name={match.awayTeam}
                                className="size-10 shrink-0 object-contain"
                            />
                            <span
                                className={cn(
                                    'text-base font-bold text-foreground',
                                    isMine
                                        ? 'group-hover:text-primary'
                                        : 'group-hover:text-primary',
                                )}
                            >
                                {match.awayTeamShort}
                            </span>
                        </Link>
                        {prediction?.confidence && (
                            <span className="ml-2 shrink-0 rounded-full border border-border/80 bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground capitalize">
                                {/^\d+$/.test(prediction.confidence)
                                    ? `${prediction.confidence}% confidence`
                                    : `${prediction.confidence} confidence`}
                            </span>
                        )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Trophy className="size-3.5 shrink-0 text-primary" />
                            {match.round}
                        </span>
                        <span className="hidden text-muted-foreground sm:inline">
                            /
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="size-3.5 text-primary" />
                            {match.date}
                        </span>
                        <span className="hidden text-muted-foreground sm:inline">
                            /
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="size-3.5 text-primary" />
                            {match.time}
                        </span>
                    </div>
                </div>

                {isMine ? (
                    <PredictionUserActions
                        match={match}
                        viewLabel={actionLabel}
                    />
                ) : (
                    <PredictionStatusAction
                        matchId={match.id}
                        label={actionLabel}
                        href={
                            isUser && userId
                                ? showUserPrediction.url({
                                      fixture: match.id,
                                      user: userId,
                                  })
                                : undefined
                        }
                    />
                )}
            </div>
        </article>
    );
}
