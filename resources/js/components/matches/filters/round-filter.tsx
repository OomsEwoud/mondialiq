interface Props {
    rounds: Array<{ label: string; value: string }>;
    selected: string;
    onChange: (value: string) => void;
}

export default function RoundFilter({ rounds, selected, onChange }: Props) {
    return (
        <label className="grid gap-2 text-xs font-bold text-[#89928c]">
            Ronde
            <select
                value={selected}
                onChange={(e) => onChange(e.target.value)}
                className="h-11 w-full rounded-md border border-[#343d37] bg-[#0d110f] px-3 text-sm font-semibold text-[#daddd9] normal-case transition-colors outline-none hover:border-[#536159] focus:border-[#57ad78] focus:ring-2 focus:ring-[#57ad78]/20"
            >
                <option value="">Alle rondes</option>
                {rounds.map((round) => (
                    <option key={round.value} value={round.value}>
                        {round.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
