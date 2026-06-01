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
        ? 'border-amber-100 bg-amber-50 text-amber-700'
        : 'border-emerald-100 bg-emerald-50 text-emerald-700';
    const ReportIcon = hasMissingPlayers ? CircleAlert : ShieldCheck;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-950/5 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-black tracking-widest text-cyan-600 uppercase">
                        Squad availability
                    </p>
                    <h2 className="mt-1 text-lg font-black text-blue-950">
                        Missing players
                    </h2>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                        Players reported missing or questionable for this
                        fixture.
                    </p>
                </div>
                <span
                    className={cn(
                        'inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black',
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
                <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                    <span className="flex size-10 items-center justify-center rounded-full bg-white text-emerald-600 ring-1 ring-slate-200">
                        <ShieldCheck className="size-4" />
                    </span>
                    <p>No missing players reported for this fixture.</p>
                </div>
            )}
        </section>
    );
}
