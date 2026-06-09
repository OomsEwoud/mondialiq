import { Badge } from '@/components/ui/feedback/badge';

interface Props {
    points: number | null;
    pointsAwarded?: boolean;
    size?: 'sm' | 'md';
    variant?: 'default' | 'indigo';
}

export default function PredictionPointsBadge({
    points,
    pointsAwarded = false,
    size = 'sm',
    variant = 'default',
}: Props) {
    const isPending = !pointsAwarded;
    const displayPoints = pointsAwarded ? (points ?? 0) : points;

    const sizeClasses =
        size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

    const variantClasses = {
        default: {
            pending: 'border-slate-200 bg-slate-50 text-slate-500',
            earned: 'border-cyan-200 bg-cyan-50 text-cyan-700',
            zero: 'border-slate-200 bg-slate-50 text-slate-500',
        },
        indigo: {
            pending: 'border-indigo-200 bg-white text-indigo-700',
            earned: 'border-indigo-200 bg-white text-indigo-700',
            zero: 'border-indigo-200 bg-white text-indigo-700',
        },
    };

    const styles = variantClasses[variant];

    if (isPending) {
        return (
            <Badge className={`${sizeClasses} font-medium ${styles.pending}`}>
                Awaiting validation
            </Badge>
        );
    }

    const hasPoints = (displayPoints ?? 0) > 0;
    const styleClass = hasPoints ? styles.earned : styles.zero;

    return (
        <Badge
            className={`${sizeClasses} ${hasPoints ? 'font-bold' : 'font-medium'} ${styleClass}`}
        >
            {displayPoints}/20 pts
        </Badge>
    );
}
