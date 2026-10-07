import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
    icon: ReactNode;
    label: string;
    value: ReactNode;
    className?: string;
}

export default function MatchInfoItem({
    icon,
    label,
    value,
    className,
}: Props) {
    return (
        <div className={cn('flex min-w-0 items-start gap-3 py-3', className)}>
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4">
                {icon}
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                {typeof value === 'string' ? (
                    <p
                        className="mt-1 text-sm font-medium break-words text-foreground"
                        title={value}
                    >
                        {value}
                    </p>
                ) : (
                    <div className="text-sm font-semibold text-foreground">
                        {value}
                    </div>
                )}
            </div>
        </div>
    );
}
