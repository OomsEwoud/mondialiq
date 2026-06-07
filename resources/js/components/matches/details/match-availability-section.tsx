import { CircleAlert, ShieldCheck } from 'lucide-react';
import MatchMissingPlayersCard from '@/components/matches/details/match-missing-players-card';
import { cn } from '@/lib/utils';
import type { MatchDetails } from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

export default function MatchAvailabilitySection({ match }: Props) {
    const hasMissingPlayers =
        match.availability.home.length > 0 ||
        match.availability.away.length > 0;
    const reportLabel = hasMissingPlayers ? 'Team news' : 'Clear report';
    const reportClassName = hasMissingPlayers
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-emerald-200 bg-emerald-50 text-emerald-800';
    const ReportIcon = hasMissingPlayers ? CircleAlert : ShieldCheck;

    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-bold tracking-wide text-cyan-600 uppercase">
                        Squad availability
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                        Missing players
                    </h2>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                        Players reported missing or questionable for this
                        fixture.
                    </p>
                </div>
                <span
                    className={cn(
                        'inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shadow-sm',
                        reportClassName,
                    )}
                >
                    <ReportIcon className="size-3.5" />
                    {reportLabel}
                </span>
            </div>

            {hasMissingPlayers ? (
                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <MatchMissingPlayersCard
                        team={match.homeTeam}
                        players={match.availability.home}
                    />
                    <MatchMissingPlayersCard
                        team={match.awayTeam}
                        players={match.availability.away}
                    />
                </div>
            ) : (
                <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-gradient-to-b from-white to-slate-50/60 px-4 py-10 text-center text-sm font-medium text-slate-500">
                    <span className="flex size-11 items-center justify-center rounded-full bg-white text-emerald-600 ring-1 ring-emerald-100 shadow-sm">
                        <ShieldCheck className="size-4" />
                    </span>
                    <p className="leading-6">
                        No missing players reported for this fixture.
                    </p>
                </div>
            )}
        </section>
    );
}
