import { cn } from '@/lib/utils';

interface Props {
    homeValue: number;
    awayValue: number;
}

export default function MatchStatComparisonBar({
    homeValue,
    awayValue,
}: Props) {
    const total = Math.abs(homeValue) + Math.abs(awayValue);
    const homePercentage = total > 0 ? (Math.abs(homeValue) / total) * 100 : 50;
    const awayPercentage = 100 - homePercentage;

    return (
        <div className="flex h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
                className={cn(
                    'bg-blue-700',
                    homeValue >= awayValue ? 'opacity-100' : 'opacity-45',
                )}
                style={{ width: `${homePercentage}%` }}
            />
            <div
                className={cn(
                    'bg-cyan-500',
                    awayValue >= homeValue ? 'opacity-100' : 'opacity-45',
                )}
                style={{ width: `${awayPercentage}%` }}
            />
        </div>
    );
}
