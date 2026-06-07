import { cn } from '@/lib/utils';

interface Props {
    label: string;
    name: string;
    align: 'left' | 'right';
}

export default function TeamHeading({ label, name, align }: Props) {
    return (
        <div
            className={cn(
                'min-w-0',
                align === 'right' ? 'text-right' : 'text-left',
            )}
        >
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                {label}
            </p>
            <p className="mt-0.5 text-xs leading-snug font-semibold text-slate-900 sm:text-sm">
                {name}
            </p>
        </div>
    );
}
