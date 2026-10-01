import { CalendarDays } from 'lucide-react';
import { useRef } from 'react';
import { useCalendar } from '@/hooks/use-calendar';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { formatReadableDate, toDateKey } from '@/utils/date';
import CalendarGrid from './calendar-grid';

interface Props {
    dates: Array<{ label: string; value: string }>;
    selected: string;
    onChange: (value: string) => void;
}

export default function DateFilter({ dates, selected, onChange }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const { open, setOpen, visibleMonth, days, openAt, prevMonth, nextMonth } =
        useCalendar(selected);
    const availableDates = new Set(dates.map((d) => d.value));
    const dateLookup = new Map(dates.map((d) => [d.value, d.label]));

    useOutsideClick(ref, () => setOpen(false), open);

    const handleSelect = (date: Date) => {
        onChange(toDateKey(date));
        setOpen(false);
    };

    const handleClear = () => {
        onChange('');
        setOpen(false);
    };

    return (
        <div
            ref={ref}
            className="relative grid gap-2 text-xs font-bold text-[#89928c]"
        >
            Datum
            <button
                type="button"
                aria-expanded={open}
                aria-label={selected ? `Datum: ${selected}` : 'Kies een datum'}
                onClick={() => (open ? setOpen(false) : openAt(selected))}
                className="flex h-11 w-full items-center justify-between rounded-md border border-[#343d37] bg-[#0d110f] px-3 text-left text-sm font-semibold text-[#daddd9] normal-case transition-colors outline-none hover:border-[#536159] focus:border-[#57ad78] focus:ring-2 focus:ring-[#57ad78]/20"
            >
                <span className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-[#70b98e]" />
                    {selected
                        ? (dateLookup.get(selected) ??
                          formatReadableDate(selected))
                        : 'Kies een datum'}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                    Kalender
                </span>
            </button>
            {open && (
                <CalendarGrid
                    visibleMonth={visibleMonth}
                    days={days}
                    selectedDate={selected}
                    availableDates={availableDates}
                    onSelect={handleSelect}
                    onPrev={prevMonth}
                    onNext={nextMonth}
                    onClear={handleClear}
                    onClose={() => setOpen(false)}
                />
            )}
        </div>
    );
}
