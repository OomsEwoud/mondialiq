import { cn } from '@/lib/utils';

interface Props {
    logo: string;
    name: string;
    code: string;
    align?: 'left' | 'right';
}

export default function UserPredictionTeam({
    logo,
    name,
    code,
    align = 'left',
}: Props) {
    return (
        <div
            className={cn(
                'flex min-w-0 items-center gap-2',
                align === 'right' && 'flex-row-reverse text-right',
            )}
        >
            <img src={logo} alt={name} className="h-9 w-9 object-contain" />
            <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                    {code}
                </p>
                <p className="truncate text-xs text-slate-500">{name}</p>
            </div>
        </div>
    );
}
