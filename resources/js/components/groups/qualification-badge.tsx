import { cn } from '@/lib/utils';

interface Props {
    qualified: boolean;
}

export default function QualificationBadge({ qualified }: Props) {
    return (
        <span
            className={cn(
                'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black whitespace-nowrap uppercase shadow-sm',
                qualified
                    ? 'border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,1),rgba(209,250,229,0.82))] text-emerald-800 shadow-emerald-950/5'
                    : 'border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(241,245,249,0.92))] text-slate-600 shadow-cyan-950/5',
            )}
        >
            {qualified ? 'Qualified' : 'Not qualified'}
        </span>
    );
}
