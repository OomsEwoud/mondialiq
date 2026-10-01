import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
    src: string;
    name: string;
    className?: string;
}

export default function TeamCrest({ src, name, className }: Props) {
    const [failedSource, setFailedSource] = useState<string | null>(null);

    return (
        <span
            className={cn(
                'inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted',
                className,
            )}
        >
            {src && failedSource !== src ? (
                <img
                    src={src}
                    alt={name}
                    className="size-full object-contain p-1"
                    ref={(image) => {
                        if (image?.complete && image.naturalWidth === 0)
                            setFailedSource(src);
                    }}
                    onError={() => setFailedSource(src)}
                />
            ) : (
                <span
                    role="img"
                    aria-label={name}
                    className="text-xs font-bold text-muted-foreground"
                >
                    {name.slice(0, 3).toUpperCase()}
                </span>
            )}
        </span>
    );
}
