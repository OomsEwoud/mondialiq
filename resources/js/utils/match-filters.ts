import type { Filters } from '@/types/match-page';

export function filledMatchFilters(filters: Filters): Partial<Filters> {
    return Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => {
            if (key === 'status') {
                return value !== 'all';
            }

            return value.trim() !== '';
        }),
    ) as Partial<Filters>;
}
