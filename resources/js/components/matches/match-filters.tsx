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
        <section className="mb-6 rounded-lg border border-[#29312c] bg-[#111513] p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-bold text-[#f3f4f1]">
                        Vind je wedstrijd
                    </h2>
                    <p className="mt-1 text-xs text-[#7f8882]">
                        Filter op status, ronde, datum of team.
                    </p>
                </div>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="inline-flex size-9 items-center justify-center gap-2 rounded-md border border-[#343d37] text-[#939c96] transition-colors hover:border-[#536159] hover:bg-[#1a211d] hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none sm:w-auto sm:px-3"
                        aria-label="Wis alle filters"
                        title="Wis alle filters"
                    >
                        <X size={15} />
                        <span className="hidden sm:inline">Wis filters</span>
                    </button>
                )}
            </div>

            <div className="mb-5 border-b border-[#29312c] pb-5">
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
