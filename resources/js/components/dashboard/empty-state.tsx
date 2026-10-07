import { Link } from '@inertiajs/react';

import type { RouteDefinition } from '@/wayfinder';

type Props = {
    title: string;
    description: string;
    action?: {
        label: string;
        href: RouteDefinition<'get'>;
    };
};

export default function EmptyState({ title, description, action }: Props) {
    return (
        <div className="rounded-xl border border-dashed border-border-strong bg-surface px-5 py-7 sm:px-6">
            <p className="text-sm font-bold text-foreground">{title}</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-text-muted">
                {description}
            </p>
            {action && (
                <Link
                    href={action.href}
                    className="mt-4 inline-flex rounded-md text-sm font-semibold text-positive transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1311] focus-visible:outline-none"
                >
                    {action.label}
                </Link>
            )}
        </div>
    );
}
