import { cn } from '@/lib/utils';

import MondialIQLogo from './mondialiq-logo';

type Props = {
    className?: string;
    markClassName?: string;
    textClassName?: string;
    showText?: boolean;
};

const logoMarkClassName = 'h-10 w-10 rounded-xl';

const logoTextClassName = 'text-xl font-black tracking-normal text-[#111513]';

export default function AppLogo({
    className,
    markClassName,
    textClassName,
    showText = true,
}: Props) {
    return (
        <div className={cn('flex items-center gap-3', className)}>
            <MondialIQLogo
                aria-hidden="true"
                className={cn(logoMarkClassName, markClassName)}
                variant="icon"
            />
            {showText && (
                <span className={cn(logoTextClassName, textClassName)}>
                    Mondial<span className="text-[#70b98e]">IQ</span>
                </span>
            )}
        </div>
    );
}
