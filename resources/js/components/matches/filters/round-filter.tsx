import FilterDropdown from '@/components/filters/filter-dropdown';

interface Props {
    rounds: Array<{ label: string; value: string }>;
    selected: string;
    onChange: (value: string) => void;
}

export default function RoundFilter({ rounds, selected, onChange }: Props) {
    return (
        <FilterDropdown
            label="Ronde"
            value={selected}
            options={[{ label: 'Alle rondes', value: '' }, ...rounds]}
            onChange={onChange}
        />
    );
}
