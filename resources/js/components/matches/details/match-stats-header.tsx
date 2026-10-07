import TeamHeading from '@/components/matches/details/team-heading';

interface Props {
    homeName: string;
    awayName: string;
}

export default function MatchStatsHeader({ homeName, awayName }: Props) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 border-b border-border pb-4 sm:gap-4">
            <TeamHeading label="Thuis" name={homeName} align="left" />
            <span className="pt-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                vs
            </span>
            <TeamHeading label="Uit" name={awayName} align="right" />
        </div>
    );
}
