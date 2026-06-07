import { cn } from '@/lib/utils';

interface Props {
    qualified: boolean;
}

export default function QualificationBadge({ qualified }: Props) {
    return (
        <span
            className={cn(
                'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap uppercase',
                qualified
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600',
            )}
        >
            {qualified ? 'Qualified' : 'Not qualified'}
        </span>
    );
}
