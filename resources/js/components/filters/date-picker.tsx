import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useId, useRef } from 'react';
import { useCalendar } from '@/hooks/use-calendar';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { cn } from '@/lib/utils';
import { toDateKey } from '@/utils/date';

interface Props {
    label: string;
    selected: string;
    align?: 'left' | 'right';
    onChange: (value: string) => void;
}

export default function DatePicker({
    label,
    selected,
    align = 'left',
    onChange,
}: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const calendarId = useId();
    const { open, setOpen, visibleMonth, days, openAt, prevMonth, nextMonth } =
        useCalendar(selected);

    useOutsideClick(ref, () => setOpen(false), open);

    const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat('nl-BE', options).format(date);

    const handleSelect = (date: Date) => {
        onChange(toDateKey(date));
        setOpen(false);
    };

    return (
        <div
            ref={ref}
            className="relative grid min-w-0 gap-2 text-xs font-bold text-muted-foreground"
        >
            {label}
            <button
                type="button"
                aria-label={
                    selected
                        ? `${label}: ${formatDate(
                              new Date(`${selected}T00:00:00`),
                              {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                              },
                          )}`
                        : `${label} kiezen`
                }
                aria-expanded={open}
                aria-controls={calendarId}
                onClick={() => (open ? setOpen(false) : openAt(selected))}
                onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                        setOpen(false);
                    }
                }}
                className="flex h-11 w-full min-w-0 items-center justify-between rounded-md border border-border-strong bg-surface px-3 text-left text-sm font-semibold text-foreground transition-colors hover:border-border-strong focus:border-ring focus:ring-2 focus:ring-ring/20 focus-visible:outline-none"
            >
                <span>
                    {selected
                        ? formatDate(new Date(`${selected}T00:00:00`), {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                          })
                        : 'Kies een datum'}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                    Kalender
                </span>
            </button>
            {open && (
                <div
                    id={calendarId}
                    role="dialog"
                    aria-label={`${label} kiezen`}
                    className={cn(
                        'absolute top-full z-30 mt-2 w-[min(19rem,calc(100vw-2.5rem))] rounded-lg border border-border-strong bg-surface-interactive p-3 text-foreground shadow-2xl shadow-black/50',
                        align === 'right' ? 'right-0' : 'left-0',
                    )}
                >
                    <div className="mb-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="inline-flex size-9 items-center justify-center rounded-md border border-border-strong text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            aria-label="Vorige maand"
                        >
                            <ChevronLeft size={16} aria-hidden="true" />
                        </button>
                        <span className="text-sm font-semibold text-foreground">
                            {formatDate(visibleMonth, {
                                month: 'long',
                                year: 'numeric',
                            })}
                        </span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="inline-flex size-9 items-center justify-center rounded-md border border-border-strong text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            aria-label="Volgende maand"
                        >
                            <ChevronRight size={16} aria-hidden="true" />
                        </button>
                    </div>

                    <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-primary uppercase">
                        {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(
                            (day) => (
                                <span key={day}>{day}</span>
                            ),
                        )}
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
                            const isActive = dateKey === selected;
                            const isToday = dateKey === toDateKey(new Date());

                            return (
                                <button
                                    key={dateKey}
                                    type="button"
                                    aria-pressed={isActive}
                                    aria-label={formatDate(date, {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                    onClick={() => handleSelect(date)}
                                    className={cn(
                                        'aspect-square rounded-sm text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                        isActive
                                            ? 'bg-crest-surface text-background'
                                            : 'text-text-secondary hover:bg-muted hover:text-foreground',
                                        isToday &&
                                            !isActive &&
                                            'ring-1 ring-[#70b98e]',
                                    )}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3">
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setOpen(false);
                            }}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                            Wis datum
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                            Sluiten
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
