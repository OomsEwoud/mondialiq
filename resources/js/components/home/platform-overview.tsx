import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { products } from '@/const/products';
import { cn } from '@/lib/utils';

export default function PlatformOverview() {
    return (
        <section className="rounded-2xl border border-border bg-gradient-to-b from-card to-accent/80 p-5 shadow-sm sm:p-6 lg:p-7">
            <header className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                    <p className="mb-2 text-xs font-semibold tracking-wide text-primary uppercase">
                        Platform modules
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Built for fans who want signal, not noise
                    </h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-primary sm:text-base">
                    Public model predictions, live match data and personal
                    prediction games stay clearly separate, so you always know
                    what is AI, what is live data and what is yours.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {products.map((product) => (
                    <Link
                        key={product.title}
                        href={product.href}
                        className={cn(
                            'group flex min-h-56 flex-col justify-between rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:p-5',
                            product.featured
                                ? 'border-border bg-gradient-to-b from-accent/60 to-card'
                                : 'border-border',
                        )}
                    >
                        <div>
                            <div className="mb-5 flex items-start justify-between gap-3">
                                <span
                                    className={cn(
                                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-foreground shadow-sm',
                                        product.featured
                                            ? 'bg-primary'
                                            : 'bg-surface-interactive',
                                    )}
                                >
                                    <product.icon className="h-5 w-5" />
                                </span>
                                <span
                                    className={cn(
                                        'rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase',
                                        product.featured
                                            ? 'bg-brand-subtle text-primary'
                                            : 'bg-surface-interactive text-muted-foreground',
                                    )}
                                >
                                    {product.badge}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                                {product.title}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-primary">
                                {product.description}
                            </p>
                        </div>

                        <span
                            className={cn(
                                'mt-5 inline-flex items-center gap-2 text-sm font-semibold transition-colors',
                                product.featured
                                    ? 'text-primary group-hover:text-foreground'
                                    : 'text-foreground group-hover:text-primary',
                            )}
                        >
                            {product.cta}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
