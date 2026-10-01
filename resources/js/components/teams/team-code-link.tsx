import { Link } from '@inertiajs/react';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import { show as showTeam } from '@/routes/teams';

interface Props {
    id: number;
    code: string;
    logo: string;
    name: string;
    reverse?: boolean;
}

export default function TeamCodeLink({
    id,
    code,
    logo,
    name,
    reverse = false,
}: Props) {
    return (
        <Link
            href={showTeam.url(id)}
            aria-label={`View ${name} team details`}
            className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
            {!reverse && (
                <ImageWithFallback
                    src={logo}
                    alt={name}
                    className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                />
            )}
            <span className="rounded-lg border border-border bg-muted px-3 py-1.5 text-sm font-bold text-foreground">
                {code}
            </span>
            {reverse && (
                <ImageWithFallback
                    src={logo}
                    alt={name}
                    className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                />
            )}
        </Link>
    );
}
