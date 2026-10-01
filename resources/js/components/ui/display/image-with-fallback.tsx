import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export default function ImageWithFallback({
    src,
    alt = '',
    className,
    style,
    onError,
    ...props
}: ComponentProps<'img'>) {
    const [failedSource, setFailedSource] = useState<string | undefined | null>(
        null,
    );

    if (!src || failedSource === src) {
        return (
            <span
                className={cn(
                    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground',
                    className,
                )}
                style={style}
                role={alt ? 'img' : undefined}
                aria-label={alt || undefined}
                aria-hidden={!alt}
            >
                <ImageOff
                    className="size-4 max-h-full max-w-full"
                    aria-hidden="true"
                />
            </span>
        );
    }

    return (
        <img
            {...props}
            src={src}
            alt={alt}
            className={className}
            style={style}
            ref={(image) => {
                if (image?.complete && image.naturalWidth === 0)
                    setFailedSource(src);
            }}
            onError={(event) => {
                setFailedSource(src);
                onError?.(event);
            }}
        />
    );
}
