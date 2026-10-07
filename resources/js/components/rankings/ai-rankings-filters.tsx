import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useId, useState } from 'react';
import FilterDropdown from '@/components/filters/filter-dropdown';
import { cn } from '@/lib/utils';
import type {
    AiPerformancePageProps,
    PerformanceFilters,
} from '@/types/ai-ranking';

interface Props extends Pick<
    AiPerformancePageProps,
    'filters' | 'competitionOptions' | 'teamOptions'
> {
    loading: boolean;
    onChange: (filters: PerformanceFilters) => void;
}

export default function AiPerformanceFilters({
    filters,
    competitionOptions,
    teamOptions,
    loading,
    onChange,
}: Props) {
    const [expanded, setExpanded] = useState(false);
    const panelId = useId();
    const activeCount =
        Number(filters.competition !== null) +
        Number(filters.team !== null) +
        Number(filters.period !== '30d') +
        Number(filters.predictionType !== 'all') +
        Number(filters.confidence !== 'all');
    const active =
        filters.competition !== null ||
        filters.team !== null ||
        filters.period !== '30d' ||
        filters.predictionType !== 'all' ||
        filters.confidence !== 'all';

    return (
        <section
            aria-label="AI-prestaties filteren"
            aria-busy={loading}
            className="mb-8 border-y border-border-subtle py-5"
        >
            <div className="flex items-center justify-between gap-3 lg:hidden">
                <span className="text-sm text-muted-foreground">
                    {filters.period === 'all'
                        ? 'Alle periodes'
                        : `Laatste ${parseInt(filters.period, 10)} dagen`}
                </span>
                <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setExpanded(!expanded)}
                    className={cn(
                        'inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                        expanded || activeCount > 0
                            ? 'border-[#4b745b] bg-[#18251d] text-positive'
                            : 'border-border-strong bg-[#111713] text-foreground hover:bg-[#18201b]',
                    )}
                >
                    <SlidersHorizontal aria-hidden="true" className="size-4" />
                    Filters{activeCount > 0 && <span>· {activeCount}</span>}
                    <ChevronDown
                        aria-hidden="true"
                        className={cn(
                            'size-4 transition-transform motion-reduce:transition-none',
                            expanded && 'rotate-180',
                        )}
                    />
                </button>
            </div>
            <div
                id={panelId}
                className={cn(
                    'gap-4 sm:grid-cols-2 lg:grid lg:grid-cols-5',
                    expanded ? 'mt-5 grid lg:mt-0' : 'hidden',
                )}
            >
                <FilterDropdown
                    disabled={loading}
                    label="Competitie"
                    value={filters.competition?.toString() ?? 'all'}
                    options={[
                        { label: 'Alle competities', value: 'all' },
                        ...competitionOptions.map((option) => ({
                            label: option.name,
                            value: option.id.toString(),
                        })),
                    ]}
                    onChange={(value) =>
                        onChange({
                            ...filters,
                            competition: value === 'all' ? null : Number(value),
                        })
                    }
                />
                <FilterDropdown
                    disabled={loading}
                    label="Team"
                    value={filters.team?.toString() ?? 'all'}
                    options={[
                        { label: 'Alle teams', value: 'all' },
                        ...teamOptions.map((option) => ({
                            label: option.name,
                            value: option.id.toString(),
                        })),
                    ]}
                    onChange={(value) =>
                        onChange({
                            ...filters,
                            team: value === 'all' ? null : Number(value),
                        })
                    }
                />
                <FilterDropdown
                    disabled={loading}
                    label="Periode"
                    value={filters.period}
                    options={[
                        { label: 'Laatste 7 dagen', value: '7d' },
                        { label: 'Laatste 30 dagen', value: '30d' },
                        { label: 'Laatste 90 dagen', value: '90d' },
                        { label: 'Laatste 12 maanden', value: '365d' },
                        { label: 'Alle periodes', value: 'all' },
                    ]}
                    onChange={(period) => onChange({ ...filters, period })}
                />
                <FilterDropdown
                    disabled={loading}
                    label="Voorspellingstype"
                    value={filters.predictionType}
                    options={[
                        { label: 'Alle uitkomsten', value: 'all' },
                        { label: 'Wedstrijduitkomst (1X2)', value: 'outcome' },
                        { label: 'Exacte score', value: 'exact' },
                        { label: 'Dubbele kans', value: 'double_chance' },
                    ]}
                    onChange={(predictionType) =>
                        onChange({ ...filters, predictionType })
                    }
                />
                <FilterDropdown
                    disabled={loading}
                    label="Confidence"
                    value={filters.confidence}
                    options={[
                        { label: 'Alle niveaus', value: 'all' },
                        { label: 'Hoog · vanaf 75%', value: 'high' },
                        { label: 'Gemiddeld · 50 tot 75%', value: 'medium' },
                        { label: 'Laag · onder 50%', value: 'low' },
                        { label: 'Niet vastgelegd', value: 'unknown' },
                    ]}
                    onChange={(confidence) =>
                        onChange({ ...filters, confidence })
                    }
                />
            </div>
            <div className="mt-3 flex min-h-9 items-center justify-between gap-3 text-xs text-muted-foreground">
                <p role="status">
                    {loading
                        ? 'Prestaties laden…'
                        : 'Eén engine. Resultaten op basis van echte wedstrijduitslagen.'}
                </p>
                {active && (
                    <button
                        type="button"
                        onClick={() =>
                            onChange({
                                competition: null,
                                team: null,
                                period: '30d',
                                predictionType: 'all',
                                confidence: 'all',
                            })
                        }
                        className="min-h-11 shrink-0 rounded-md px-2 font-semibold text-positive hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        Filters wissen
                    </button>
                )}
            </div>
        </section>
    );
}
