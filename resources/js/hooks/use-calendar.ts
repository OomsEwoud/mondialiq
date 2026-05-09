import { useMemo, useState } from 'react';
import { addMonths, startOfMonth } from '@/utils/date';

export function useCalendar(selectedDate: string) {
    const [open, setOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(() =>
        startOfMonth(selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date()),
    );

    const days = useMemo(() => {
        const firstWeekday = startOfMonth(visibleMonth).getDay();
        const daysInMonth = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth() + 1,
            0,
        ).getDate();

        const cells: Array<Date | null> = Array.from({ length: firstWeekday }, () => null);

        for (let day = 1; day <= daysInMonth; day++) {
            cells.push(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));
        }

        return cells;
    }, [visibleMonth]);

    const openAt = (date: string) => {
        setVisibleMonth(startOfMonth(date ? new Date(`${date}T00:00:00`) : new Date()));
        setOpen(true);
    };

    return {
        open,
        setOpen,
        visibleMonth,
        days,
        openAt,
        prevMonth: () => setVisibleMonth((m) => addMonths(m, -1)),
        nextMonth: () => setVisibleMonth((m) => addMonths(m, 1)),
    };
}