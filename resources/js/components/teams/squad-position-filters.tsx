import { Button } from '@/components/ui/forms/button';
import { squadPositionFilters } from '@/const/team-squad';
import { cn } from '@/lib/utils';
import type { SquadPositionFilter } from '@/const/team-squad';

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
                        ? 'rounded-[1.45rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,0.96))] p-2.5 shadow-lg shadow-cyan-950/6'
                        : 'flex gap-2',
                )}
            >
                {isDesktop && (
                    <div className="px-2 pb-2">
                        <p className="text-xs font-black tracking-[0.18em] text-cyan-700 uppercase">
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
                                'border px-3 text-sm font-black shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2',
                                isDesktop
                                    ? 'mb-1 h-11 w-full justify-start rounded-2xl'
                                    : 'h-9 shrink-0 rounded-full',
                                isActive
                                    ? 'border-cyan-200 bg-[linear-gradient(180deg,rgba(236,254,255,1),rgba(207,250,254,0.88))] text-cyan-700 hover:bg-cyan-50 hover:text-cyan-700'
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
