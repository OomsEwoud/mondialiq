import type { SVGAttributes } from 'react';

import { cn } from '@/lib/utils';

type MondialIQLogoProps = SVGAttributes<SVGSVGElement> & {
    variant?: 'horizontal' | 'icon' | 'navbar';
};

const markPath =
    'M110 342V170H166L256 250L346 170H402V342H334V263L256 333L178 263V342H110Z';

export default function MondialIQLogo({
    className,
    variant = 'horizontal',
    ...props
}: MondialIQLogoProps) {
    if (variant === 'icon') {
        return (
            <svg
                {...props}
                aria-label="MondialIQ"
                className={cn('h-10 w-10', className)}
                fill="none"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect width="512" height="512" rx="112" fill="#F3F4F1" />
                <rect
                    x="20"
                    y="20"
                    width="472"
                    height="472"
                    rx="96"
                    fill="#111513"
                    stroke="#303732"
                    strokeWidth="4"
                />
                <path d={markPath} fill="#F3F4F1" />
                <circle cx="386" cy="126" r="34" fill="#57AD78" />
                <circle cx="386" cy="126" r="9" fill="#111513" />
            </svg>
        );
    }

    const primary = variant === 'navbar' ? '#F3F4F1' : '#111513';
    const tile = variant === 'navbar' ? '#171C19' : '#111513';

    return (
        <svg
            {...props}
            aria-label="MondialIQ"
            className={cn('h-12 w-auto', className)}
            fill="none"
            viewBox="0 0 960 240"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g transform="translate(36 28) scale(0.36)">
                <rect width="512" height="512" rx="112" fill={tile} />
                <path d={markPath} fill="#F3F4F1" />
                <circle cx="386" cy="126" r="34" fill="#57AD78" />
                <circle cx="386" cy="126" r="9" fill={tile} />
            </g>
            <text
                x="250"
                y="145"
                fill={primary}
                fontFamily="Instrument Sans, ui-sans-serif, system-ui, sans-serif"
                fontSize="82"
                fontWeight="800"
                letterSpacing="0"
            >
                Mondial
            </text>
            <text
                x="600"
                y="145"
                fill="#70B98E"
                fontFamily="Instrument Sans, ui-sans-serif, system-ui, sans-serif"
                fontSize="82"
                fontWeight="900"
                letterSpacing="0"
            >
                IQ
            </text>
        </svg>
    );
}
