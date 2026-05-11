interface Props {
    label: string;
    logo: string;
    name: string;
    align?: 'left' | 'right';
}

export default function MatchDetailTeam({
    label,
    logo,
    name,
    align = 'left',
}: Props) {
    const isRightAligned = align === 'right';

    return (
        <div
            className={`flex items-center gap-3 ${isRightAligned ? 'sm:flex-row-reverse sm:text-right' : ''}`}
        >
            <img
                src={logo}
                alt={name}
                className="h-10 w-10 shrink-0 object-contain"
            />
            <div>
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className="font-bold text-slate-800">{name}</p>
            </div>
        </div>
    );
}
