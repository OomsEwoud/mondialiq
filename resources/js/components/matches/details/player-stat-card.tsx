import { cn } from '@/lib/utils';

export function PrimaryStatCard({
    label,
    value,
    sublabel,
    highlight,
}: {
    label: string;
    value: string;
    sublabel?: string;
    highlight?: boolean;
}) {
    if (highlight) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-3 text-center">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {label}
                </span>
                <span className="mt-1 text-2xl leading-none font-extrabold text-slate-800">
                    {value}
                </span>
                {sublabel ? (
                    <span className="mt-0.5 text-[10px] font-bold text-slate-400 uppercase">
                        {sublabel}
                    </span>
                ) : null}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {label}
            </span>
            <span className="mt-1 text-xl leading-none font-extrabold text-slate-800">
                {value}
            </span>
            {sublabel ? (
                <span className="mt-0.5 text-[10px] font-bold text-slate-400 uppercase">
                    {sublabel}
                </span>
            ) : null}
        </div>
    );
}

export function SecondaryStatCard({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-h-[4.5rem] flex-col justify-center rounded-lg border border-slate-100 bg-white px-3 py-2 text-center shadow-sm">
            <span className="text-[10px] leading-tight font-semibold tracking-wide text-slate-400 uppercase">
                {label}
            </span>
            <span className="mt-0.5 text-base font-bold text-slate-800">
                {value}
            </span>
        </div>
    );
}

export function RatingStatCard({
    rating,
    ratingLabel,
    ratingStyles,
}: {
    rating: number;
    ratingLabel: string;
    ratingStyles: {
        card: string;
        text: string;
        subtext: string;
        label: string;
    };
}) {
    return (
        <div
            className={cn(
                'col-span-2 flex flex-col items-center justify-center rounded-xl border-2 p-4 text-center sm:col-span-1',
                ratingStyles.card,
            )}
        >
            <span
                className={cn(
                    'text-[10px] font-bold tracking-wider uppercase opacity-80',
                    ratingStyles.label,
                )}
            >
                Rating
            </span>
            <span
                className={cn(
                    'mt-1 text-4xl leading-none font-extrabold',
                    ratingStyles.text,
                )}
            >
                {rating.toFixed(1)}
            </span>
            <span
                className={cn(
                    'mt-1 text-[10px] font-bold tracking-wide uppercase',
                    ratingStyles.subtext,
                )}
            >
                {ratingLabel}
            </span>
        </div>
    );
}
