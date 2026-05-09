interface Props {
    rounds: Array<{ label: string; value: string }>;
    selected: string;
    onChange: (value: string) => void;
}

export default function RoundFilter({ rounds, selected, onChange }: Props) {
    return (
        <label className="grid gap-1.5 text-xs font-bold text-slate-500 uppercase">
            Round
            <select
                value={selected}
                onChange={(e) => onChange(e.target.value)}
                className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 normal-case transition-colors outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
                <option value="">All rounds</option>
                {rounds.map((round) => (
                    <option key={round.value} value={round.value}>
                        {round.label}
                    </option>
                ))}
            </select>
        </label>
    );
}