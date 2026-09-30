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
        <div className="absolute top-full left-0 z-20 mt-2 w-[min(19rem,calc(100vw-2.5rem))] rounded-md border border-[#343d37] bg-[#141916] p-3 text-[#daddd9] shadow-2xl shadow-black/50">
            <div className="mb-3 flex items-center justify-between">
                <button
                    type="button"
                    onClick={onPrev}
                    className="inline-flex size-9 items-center justify-center rounded-md border border-[#343d37] text-[#89928c] transition-colors hover:bg-[#1b211e] hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                    aria-label="Previous month"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold text-[#f3f4f1]">
                    {new Intl.DateTimeFormat('nl-BE', {
                        month: 'long',
                        year: 'numeric',
                    }).format(visibleMonth)}
                </span>
                <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex size-9 items-center justify-center rounded-md border border-[#343d37] text-[#89928c] transition-colors hover:bg-[#1b211e] hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                    aria-label="Next month"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-[#70b98e] uppercase">
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
                                'aspect-square rounded-sm text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none',
                                isActive
                                    ? 'bg-[#edf1ed] text-[#101412]'
                                    : isAvailable
                                      ? 'text-[#b8bfba] hover:bg-[#1b211e] hover:text-white'
                                      : 'cursor-not-allowed text-[#48504b]',
                            ].join(' ')}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#29312c] pt-3">
                <button
                    type="button"
                    onClick={onClear}
                    className="text-sm font-medium text-[#89928c] transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                >
                    Wis datum
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-sm font-medium text-[#89928c] transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                >
                    Sluiten
                </button>
            </div>
        </div>
    );
}
