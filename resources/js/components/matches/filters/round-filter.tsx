interface Props {
    rounds: Array<{ label: string; value: string }>;
    selected: string;
    onChange: (value: string) => void;
}

export default function RoundFilter({ rounds, selected, onChange }: Props) {
    return (
        <label className="grid gap-2 text-[11px] font-black tracking-[0.14em] text-slate-500 uppercase">
            Round
            <select
                value={selected}
                onChange={(e) => onChange(e.target.value)}
                className="h-12 w-full rounded-2xl border border-cyan-100 bg-white/90 px-4 text-sm font-semibold text-slate-800 normal-case shadow-sm shadow-cyan-950/5 transition-all outline-none hover:border-cyan-200 hover:bg-white focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
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
