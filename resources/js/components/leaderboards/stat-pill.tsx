import { cn } from '@/lib/utils';

type Props = {
    label: string;
    className?: string;
};

export default function StatPill({ label, className }: Props) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
                className,
            )}
        >
            {label}
        </span>
    );
}
