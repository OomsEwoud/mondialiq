import { CalendarDays, X } from 'lucide-react';
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
            className="relative grid gap-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
        >
            Date
            <button
                type="button"
                onClick={() => (open ? setOpen(false) : openAt(selected))}
                className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-4 text-left text-sm font-semibold text-slate-800 normal-case shadow-sm transition-all outline-none hover:border-cyan-200 hover:bg-white focus:border-cyan-300 focus:ring-4 focus:ring-slate-200"
            >
                <span className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-cyan-600" />
                    {selected
                        ? (dateLookup.get(selected) ??
                          formatReadableDate(selected))
                        : 'Pick a date'}
                </span>
                {selected ? (
                    <span
                        role="button"
                        tabIndex={-1}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                        className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={14} />
                    </span>
                ) : (
                    <span className="text-xs font-bold tracking-normal text-slate-400">
                        Calendar
                    </span>
                )}
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
