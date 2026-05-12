import { cn } from '@/lib/utils';

type Props = {
    className?: string;
    markClassName?: string;
    textClassName?: string;
    showText?: boolean;
};

export default function AppLogo({
    className,
    markClassName,
    textClassName,
    showText = true,
}: Props) {
    return (
        <div className={cn('flex items-center gap-3', className)}>
            <div
                className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-xl font-black text-blue-950 shadow-lg shadow-blue-900/20',
                    markClassName,
                )}
            >
                MI
            </div>
            {showText && (
                <span
                    className={cn(
                        'text-xl font-black tracking-tight text-slate-900',
                        textClassName,
                    )}
                >
                    Mondial<span className="text-cyan-400">IQ</span>
                </span>
            )}
        </div>
    );
}
