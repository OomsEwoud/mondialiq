interface Props {
    code: string;
    logo?: string | null;
}

export default function TeamCodeBadge({ code, logo }: Props) {
    return (
        <span className="inline-flex min-w-16 items-center justify-center gap-2 rounded-full border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 px-3 py-1 text-xs font-bold tracking-wide text-slate-700 uppercase shadow-sm">
            {logo && (
                <img
                    src={logo}
                    alt=""
                    className="size-4 rounded-full object-contain"
                />
            )}
            {code}
        </span>
    );
}
