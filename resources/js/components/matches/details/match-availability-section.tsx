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
        ? 'border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,1),rgba(253,230,138,0.72))] text-amber-800'
        : 'border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,1),rgba(209,250,229,0.82))] text-emerald-800';
    const ReportIcon = hasMissingPlayers ? CircleAlert : ShieldCheck;

    return (
        <section className="rounded-[1.85rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] p-5 shadow-xl shadow-cyan-950/8 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-black tracking-[0.18em] text-cyan-700 uppercase">
                        Squad availability
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-blue-950">
                        Missing players
                    </h2>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                        Players reported missing or questionable for this
                        fixture.
                    </p>
                </div>
                <span
                    className={cn(
                        'inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black shadow-sm',
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
                <div className="mt-5 flex flex-col items-center gap-3 rounded-[1.7rem] border border-dashed border-cyan-100 bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,0.96))] px-4 py-10 text-center text-sm font-medium text-slate-500">
                    <span className="flex size-11 items-center justify-center rounded-full bg-white text-emerald-600 ring-1 ring-emerald-100 shadow-sm shadow-emerald-950/5">
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
