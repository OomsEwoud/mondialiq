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
                        ? 'rounded-lg border border-[#29312c] bg-[#111513] p-2'
                        : 'flex gap-2',
                )}
            >
                {isDesktop && (
                    <div className="px-2 pb-2">
                        <p className="text-xs font-bold text-[#70b98e] uppercase">
                            Posities
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
                                'border px-3 text-sm font-bold shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-[#57ad78]',
                                isDesktop
                                    ? 'mb-1 h-10 w-full justify-start rounded-md'
                                    : 'h-9 shrink-0 rounded-md',
                                isActive
                                    ? 'border-[#edf1ed] bg-[#edf1ed] text-[#101412] hover:bg-white hover:text-[#101412]'
                                    : 'border-[#343d37] bg-[#111513] text-[#89928c] hover:border-[#536159] hover:bg-[#1a211d] hover:text-white',
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
