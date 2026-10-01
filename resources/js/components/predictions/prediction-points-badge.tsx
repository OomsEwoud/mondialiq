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
            pending: 'border-border bg-muted text-muted-foreground',
            earned: 'border-border bg-accent text-primary',
            zero: 'border-border bg-muted text-muted-foreground',
        },
        indigo: {
            pending: 'border-border bg-card text-primary',
            earned: 'border-border bg-card text-primary',
            zero: 'border-border bg-card text-primary',
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
