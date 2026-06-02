interface Props {
    code: string;
    logo?: string | null;
}

export default function TeamCodeBadge({ code, logo }: Props) {
    return (
        <span className="inline-flex min-w-16 items-center justify-center gap-2 rounded-full border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(241,245,249,0.92))] px-3 py-1 text-[11px] font-black tracking-[0.12em] text-slate-700 uppercase shadow-sm shadow-cyan-950/5">
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
