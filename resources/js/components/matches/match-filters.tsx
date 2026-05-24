import { X } from 'lucide-react';
import type { Filters, MatchStatusFilter } from '@/types/match-page';
import DateFilter from './filters/date-filter';
import MatchStatusTabs from './filters/match-status-tabs';
import RoundFilter from './filters/round-filter';
import TeamFilter from './filters/team-filter';

interface Props {
    rounds: Array<{ label: string; value: string }>;
    dates: Array<{ label: string; value: string }>;
    teams: string[];
    selected: Filters;
    onChange: (
        key: 'round' | 'date' | 'team' | 'status',
        value: string | MatchStatusFilter,
    ) => void;
    onClear: () => void;
}

export default function MatchFilters({
    rounds,
    dates,
    teams,
    selected,
    onChange,
    onClear,
}: Props) {
    const hasActiveFilters =
        selected.round ||
        selected.date ||
        selected.team ||
        selected.status !== 'all';

    return (
        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-sm font-bold text-blue-950">Filters</h2>
                    <p className="text-xs text-slate-500">
                        Find matches by round, date or team.
                    </p>
                </div>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700"
                    >
                        <X size={15} />
                        Clear
                    </button>
                )}
            </div>

            <div className="mb-4 border-b border-slate-100 pb-4">
                <MatchStatusTabs
                    selected={selected.status}
                    onChange={(value) => onChange('status', value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <RoundFilter
                    rounds={rounds}
                    selected={selected.round}
                    onChange={(value) => onChange('round', value)}
                />
                <DateFilter
                    dates={dates}
                    selected={selected.date}
                    onChange={(value) => onChange('date', value)}
                />
                <TeamFilter
                    teams={teams}
                    selected={selected.team}
                    onChange={(value) => onChange('team', value)}
                />
            </div>
        </section>
    );
}
