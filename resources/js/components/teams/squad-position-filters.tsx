import { Button } from '@/components/ui/forms/button';
import type { SquadPositionFilter } from '@/const/team-squad';
import { squadPositionFilters } from '@/const/team-squad';
import { cn } from '@/lib/utils';

interface Props {
    activeFilter: SquadPositionFilter['key'];
    onChange: (filter: SquadPositionFilter['key']) => void;
    variant: 'desktop' | 'mobile';
}

export default function SquadPositionFilters({
    activeFilter,
    onChange,
    variant,
}: Props) {
    const isDesktop = variant === 'desktop';

    return (
        <div
            className={cn(
                isDesktop
                    ? 'hidden lg:sticky lg:top-24 lg:block'
                    : 'overflow-x-auto pb-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden',
            )}
        >
            <div
                className={cn(
                    isDesktop
                        ? 'rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-2.5 shadow-sm'
                        : 'flex gap-2',
                )}
            >
                {isDesktop && (
                    <div className="px-2 pb-2">
                        <p className="text-xs font-bold tracking-wide text-cyan-600 uppercase">
                            Positions
                        </p>
                    </div>
                )}
                {squadPositionFilters.map((filter) => {
                    const isActive = activeFilter === filter.key;

                    return (
                        <Button
                            key={filter.key}
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-pressed={isActive}
                            onClick={() => onChange(filter.key)}
                            className={cn(
                                'border px-3 text-sm font-bold shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2',
                                isDesktop
                                    ? 'mb-1 h-11 w-full justify-start rounded-2xl'
                                    : 'h-9 shrink-0 rounded-full',
                                isActive
                                    ? 'border-cyan-200 bg-cyan-50 text-cyan-600 hover:bg-cyan-50 hover:text-cyan-600'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                            )}
                        >
                            {filter.label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
