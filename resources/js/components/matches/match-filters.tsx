import { X } from 'lucide-react';
import type { FilterKey, Filters, MatchStatusFilter } from '@/types/match-page';
import { toDateKey } from '@/utils/date';
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
    const today = toDateKey(new Date());
    const hasActiveFilters =
        selected.round ||
        selected.date ||
        selected.team ||
        selected.status !== 'all';

    return (
        <section className="mb-6 rounded-[1.75rem] border border-cyan-200/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,249,255,0.92))] p-4 shadow-xl shadow-cyan-950/8 backdrop-blur sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-sm font-black tracking-[0.16em] text-blue-950 uppercase">
                        Filters
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Fine-tune the schedule by round, date or team.
                    </p>
                </div>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 text-sm font-black text-slate-700 shadow-sm shadow-cyan-950/5 transition-all hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                        <X size={15} />
                        Clear
                    </button>
                )}
            </div>

            <div className="mb-5 flex flex-col gap-3 border-b border-cyan-100/70 pb-5 lg:flex-row lg:items-center lg:justify-between">
                <MatchStatusTabs
                    selected={selected.status}
                    onChange={(value) => onChange('status', value)}
                />
                <button
                    type="button"
                    aria-pressed={selected.date === today}
                    onClick={() =>
                        onChange('date', selected.date === today ? '' : today)
                    }
                    className={
                        selected.date === today
                            ? 'inline-flex h-10 w-fit items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 px-4 text-sm font-black text-cyan-800 shadow-sm shadow-cyan-950/5 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none'
                            : 'inline-flex h-10 w-fit items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 shadow-sm shadow-cyan-950/5 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none'
                    }
                >
                    Today
                </button>
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
