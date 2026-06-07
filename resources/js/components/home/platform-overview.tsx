import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { products } from '@/const/products';
import { cn } from '@/lib/utils';

export default function PlatformOverview() {
    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-5 shadow-sm sm:p-6 lg:p-7">
            <header className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                    <p className="mb-2 text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                        Platform modules
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Built for fans who want signal, not noise
                    </h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-cyan-600 sm:text-base">
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
                            'group flex min-h-56 flex-col justify-between rounded-2xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:p-5',
                            product.featured
                                ? 'border-slate-200 bg-gradient-to-b from-cyan-50/60 to-white'
                                : 'border-slate-200',
                        )}
                    >
                        <div>
                            <div className="mb-5 flex items-start justify-between gap-3">
                                <span
                                    className={cn(
                                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
                                        product.featured
                                            ? 'bg-cyan-600'
                                            : 'bg-slate-800',
                                    )}
                                >
                                    <product.icon className="h-5 w-5" />
                                </span>
                                <span
                                    className={cn(
                                        'rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase',
                                        product.featured
                                            ? 'bg-cyan-100 text-cyan-700'
                                            : 'bg-slate-100 text-slate-600',
                                    )}
                                >
                                    {product.badge}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                                {product.title}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-cyan-600">
                                {product.description}
                            </p>
                        </div>

                        <span
                            className={cn(
                                'mt-5 inline-flex items-center gap-2 text-sm font-semibold transition-colors',
                                product.featured
                                    ? 'text-cyan-600 group-hover:text-slate-900'
                                    : 'text-slate-700 group-hover:text-cyan-600',
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
