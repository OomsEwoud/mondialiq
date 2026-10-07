import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toDateKey } from '@/utils/date';

interface Props {
    id: string;
    visibleMonth: Date;
    days: Array<Date | null>;
    selectedDate: string;
    onSelect: (date: Date) => void;
    onPrev: () => void;
    onNext: () => void;
    onClear: () => void;
    onClose: () => void;
}

export default function CalendarGrid({
    id,
    visibleMonth,
    days,
    selectedDate,
    onSelect,
    onPrev,
    onNext,
    onClear,
    onClose,
}: Props) {
    return (
        <div
            id={id}
            role="dialog"
            aria-label="Datum kiezen"
            className="absolute top-full left-0 z-20 mt-2 w-[min(19rem,calc(100vw-2.5rem))] rounded-lg border border-border-strong bg-surface-interactive p-3 text-foreground shadow-2xl shadow-black/50"
        >
            <div className="mb-3 flex items-center justify-between">
                <button
                    type="button"
                    onClick={onPrev}
                    className="inline-flex size-9 items-center justify-center rounded-md border border-border-strong text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-label="Vorige maand"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold text-foreground">
                    {new Intl.DateTimeFormat('nl-BE', {
                        month: 'long',
                        year: 'numeric',
                    }).format(visibleMonth)}
                </span>
                <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex size-9 items-center justify-center rounded-md border border-border-strong text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-label="Volgende maand"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-primary uppercase">
                {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day) => (
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

                    return (
                        <button
                            key={dateKey}
                            type="button"
                            onClick={() => onSelect(date)}
                            className={[
                                'aspect-square rounded-sm text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                isActive
                                    ? 'bg-crest-surface text-background'
                                    : 'text-text-secondary hover:bg-muted hover:text-foreground',
                            ].join(' ')}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3">
                <button
                    type="button"
                    onClick={onClear}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    Wis datum
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    Sluiten
                </button>
            </div>
        </div>
    );
}
