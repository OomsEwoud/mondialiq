import { X } from 'lucide-react';
import type { FilterKey, Filters, MatchStatusFilter } from '@/types/match-page';
import DateFilter from './filters/date-filter';
import MatchStatusTabs from './filters/match-status-tabs';
import RoundFilter from './filters/round-filter';
import TeamFilter from './filters/team-filter';

interface Props {
    rounds: Array<{ label: string; value: string }>;
    dates: Array<{ label: string; value: string }>;
    teams: string[];
    selected: Filters;
    onChange: (key: FilterKey, value: string | MatchStatusFilter) => void;
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
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-950/5 sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-sm font-black text-slate-950">
                        Filters
                    </h2>
                    <p className="text-xs text-slate-500">
                        Find matches by round, date or team.
                    </p>
                </div>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
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
