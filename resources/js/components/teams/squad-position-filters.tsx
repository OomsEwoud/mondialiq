import { Button } from '@/components/ui/forms/button';
import type { SquadPositionFilter } from '@/const/team-squad';
import { squadPositionFilters } from '@/const/team-squad';
import { cn } from '@/lib/utils';

interface Props {
    activeFilter: SquadPositionFilter['key'];
    onChange: (filter: SquadPositionFilter['key']) => void;
}

export default function SquadPositionFilters({
    activeFilter,
    onChange,
}: Props) {
    return (
        <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
                className="flex w-max min-w-full gap-2"
                role="group"
                aria-label="Filter op positie"
            >
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
                                'h-9 shrink-0 rounded-full border px-4 text-sm font-semibold shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                                isActive
                                    ? 'border-[#52745c] bg-[#1c2a20] text-[#b5ddc1] hover:bg-[#223329] hover:text-foreground'
                                    : 'border-border-strong bg-surface text-[#929b95] hover:border-border-strong hover:bg-surface-interactive hover:text-foreground',
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
