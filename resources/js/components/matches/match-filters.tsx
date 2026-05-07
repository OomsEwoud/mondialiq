interface Props {
    rounds: string[];
    dates: string[];
    teams: string[];
    selected: {
        round: string;
        date: string;
        team: string;
    };
    onChange: (key: 'round' | 'date' | 'team', value: string) => void;
}

export default function MatchFilters({ rounds, dates, teams, selected, onChange }: Props) {
    const selectClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";
    
    return (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                    Round
                </label>
                <select
                    className={selectClass}
                    value={selected.round}
                    onChange={(e) => onChange('round', e.target.value)}
                >
                    <option value="">All Rounds</option>
                    {rounds.map((r) => (
                        <option key={r} value={r}>
                            {r}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                    Date
                </label>
                <select
                    className={selectClass}
                    value={selected.date}
                    onChange={(e) => onChange('date', e.target.value)}
                >
                    <option value="">All Dates</option>
                    {dates.map((d) => (
                        <option key={d} value={d}>
                            {d}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                    Team
                </label>
                <select
                    className={selectClass}
                    value={selected.team}
                    onChange={(e) => onChange('team', e.target.value)}
                >
                    <option value="">All Teams</option>
                    {teams.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
