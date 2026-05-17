import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, Clock, LockKeyhole } from 'lucide-react';
import { login } from '@/routes';
import UserPredictionTeam from '@/components/matches/user-prediction-team';
import { Button } from '@/components/ui/forms/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/overlays/dialog';
import type { Auth } from '@/types/auth';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UserPredictionModal({
    match,
    open,
    onOpenChange,
}: Props) {
    const auth = usePage<{ auth: Auth }>().props.auth;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto border-slate-200 bg-white sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {match.userPrediction
                            ? 'Edit your prediction'
                            : 'Make your prediction'}
                    </DialogTitle>
                    <DialogDescription>
                        Pick the match outcome before kickoff.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <UserPredictionTeam
                            logo={match.homeTeamLogo}
                            name={match.homeTeam}
                            code={match.homeTeamShort}
                        />
                        <span className="text-xs font-black text-slate-300">
                            VS
                        </span>
                        <UserPredictionTeam
                            logo={match.awayTeamLogo}
                            name={match.awayTeam}
                            code={match.awayTeamShort}
                            align="right"
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-blue-600" />
                            {match.date}
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            {match.time}
                        </span>
                    </div>
                </div>

                {match.userPrediction && (
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                        Current pick:{' '}
                        <span className="font-bold">
                            {match.userPrediction.label}
                        </span>
                    </div>
                )}

                {!auth.user ? (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
                        <LockKeyhole className="mx-auto h-5 w-5 text-blue-600" />
                        <p className="mt-2 text-sm font-bold text-slate-900">
                            Log in to make a prediction
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Save your picks and track them throughout the
                            tournament.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href={login.url()}>
                                Log in to make a prediction
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                        Prediction form comes next.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
