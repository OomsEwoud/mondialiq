type Props = {
    label: string;
};

export default function StatPill({ label }: Props) {
    return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            {label}
        </span>
    );
}
