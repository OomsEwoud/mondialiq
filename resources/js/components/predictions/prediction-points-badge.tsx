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
                    ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
            }
        >
            {hasPoints ? `${points}/20 pts` : 'Points pending'}
        </Badge>
    );
}
