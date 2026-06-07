import { X } from 'lucide-react';
import type { FilterKey, Filters, MatchStatusFilter } from '@/types/match-page';
import { toDateKey } from '@/utils/date';
import DateFilter from './filters/date-filter';
import MatchStatusTabs from './filters/match-status-tabs';
import RoundFilter from './filters/round-filter';
import TeamFilter from './filters/team-filter';

type MatchStatusTabValue = MatchStatusFilter | 'today';

interface Props {
    rounds: Array<{ label: string; value: string }>;
    dates: Array<{ label: string; value: string }>;
    teams: string[];
    selected: Filters;
    onChange: (key: FilterKey, value: string | MatchStatusFilter) => void;
    onQuickChange: (values: Pick<Filters, 'date' | 'status'>) => void;
    onClear: () => void;
}

export default function MatchFilters({
    rounds,
    dates,
    teams,
    selected,
    onChange,
    onQuickChange,
    onClear,
}: Props) {
    const today = toDateKey(new Date());
    const hasActiveFilters =
        selected.round ||
        selected.date ||
        selected.team ||
        selected.status !== 'all';
    const selectedMatchStatus: MatchStatusTabValue =
        selected.status !== 'all'
            ? selected.status
            : selected.date === today
              ? 'today'
              : 'all';
    const handleMatchStatusChange = (value: MatchStatusTabValue) => {
        if (value === 'today') {
            onQuickChange({ date: today, status: 'all' });

            return;
        }

        onQuickChange({ date: '', status: value });
    };

    return (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                        Filters
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Fine-tune the schedule by status, round, date or team.
                    </p>
                </div>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                        <X size={15} />
                        Clear
                    </button>
                )}
            </div>

            <div className="mb-5 border-b border-slate-200 pb-5">
                <p className="mb-2 text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                    Match status
                </p>
                <MatchStatusTabs
                    selected={selectedMatchStatus}
                    onChange={handleMatchStatusChange}
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
