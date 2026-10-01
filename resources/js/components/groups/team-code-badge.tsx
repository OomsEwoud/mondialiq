import ImageWithFallback from '@/components/ui/display/image-with-fallback';
interface Props {
    code: string;
    logo?: string | null;
}

export default function TeamCodeBadge({ code, logo }: Props) {
    return (
        <span className="inline-flex min-w-16 items-center justify-center gap-2 rounded-full border border-border bg-gradient-to-b from-card to-card/60 px-3 py-1 text-xs font-bold tracking-wide text-foreground uppercase shadow-sm">
            {logo && (
                <ImageWithFallback
                    src={logo}
                    alt=""
                    className="size-4 rounded-full object-contain"
                />
            )}
            {code}
        </span>
    );
}
