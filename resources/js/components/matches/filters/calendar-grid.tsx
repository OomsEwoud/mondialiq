import { ChevronLeft, ChevronRight } from 'lucide-react';
import { weekDays } from '@/const/filters';
import { toDateKey } from '@/utils/date';

interface Props {
    visibleMonth: Date;
    days: Array<Date | null>;
    selectedDate: string;
    availableDates: Set<string>;
    onSelect: (date: Date) => void;
    onPrev: () => void;
    onNext: () => void;
    onClear: () => void;
    onClose: () => void;
}

export default function CalendarGrid({
    visibleMonth,
    days,
    selectedDate,
    availableDates,
    onSelect,
    onPrev,
    onNext,
    onClear,
    onClose,
}: Props) {
    return (
        <div className="absolute top-full left-0 z-20 mt-2 w-[19rem] rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <button
                    type="button"
                    onClick={onPrev}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
                    aria-label="Previous month"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold text-slate-950">
                    {new Intl.DateTimeFormat('en-GB', {
                        month: 'long',
                        year: 'numeric',
                    }).format(visibleMonth)}
                </span>
                <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
                    aria-label="Next month"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                {weekDays.map((day) => (
                    <span key={day}>{day}</span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                    if (!date) {
                        return (
                            <span
                                key={`empty-${index}`}
                                className="aspect-square"
                            />
                        );
                    }

                    const dateKey = toDateKey(date);
                    const isActive = dateKey === selectedDate;
                    const isAvailable = availableDates.has(dateKey);

                    return (
                        <button
                            key={dateKey}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => onSelect(date)}
                            className={[
                                'aspect-square rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none',
                                isActive
                                    ? 'bg-cyan-600 text-white shadow-sm'
                                    : isAvailable
                                      ? 'text-slate-800 hover:bg-slate-50 hover:text-slate-950'
                                      : 'cursor-not-allowed text-slate-300',
                            ].join(' ')}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <button
                    type="button"
                    onClick={onClear}
                    className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
                >
                    Clear date
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-sm font-medium text-slate-600 transition-colors hover:text-cyan-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
