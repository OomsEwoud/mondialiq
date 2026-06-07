import TeamHeading from '@/components/matches/details/team-heading';

interface Props {
    homeName: string;
    awayName: string;
}

export default function MatchStatsHeader({ homeName, awayName }: Props) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:gap-4 sm:px-4">
            <TeamHeading label="Home" name={homeName} align="left" />
            <span className="pt-5 text-xs font-semibold tracking-wide text-slate-300 uppercase">
                vs
            </span>
            <TeamHeading label="Away" name={awayName} align="right" />
        </div>
    );
}
