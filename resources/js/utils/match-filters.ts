import type { Filters } from '@/types/match-page';

export function filledMatchFilters(filters: Filters): Partial<Filters> {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value.trim() !== ''),
    ) as Partial<Filters>;
}
