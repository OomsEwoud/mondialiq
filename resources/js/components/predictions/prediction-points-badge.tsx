import { Badge } from '@/components/ui/feedback/badge';

interface Props {
    points: number | null;
}

export default function PredictionPointsBadge({ points }: Props) {
    const hasPoints = points !== null;

    return (
        <Badge
            className={
                hasPoints
                    ? 'border-cyan-200 bg-[linear-gradient(180deg,rgba(236,254,255,1),rgba(207,250,254,0.88))] text-cyan-800'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
            }
        >
            {hasPoints ? `${points}/20 pts` : 'Awaiting validation'}
        </Badge>
    );
}
