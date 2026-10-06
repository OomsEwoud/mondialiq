import DatePicker from '@/components/filters/date-picker';

interface Props {
    selected: string;
    onChange: (value: string) => void;
}

export default function DateFilter({ selected, onChange }: Props) {
    return (
        <DatePicker
            label="Datum"
            selected={selected}
            align="right"
            onChange={onChange}
        />
    );
}
