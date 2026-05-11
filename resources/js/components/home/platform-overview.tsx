import { Link } from '@inertiajs/react';
import {
    ArrowRight,
} from 'lucide-react';
import { products } from '@/const/products';



export default function PlatformOverview() {
    return (
        <section className="mb-8 rounded-2xl border border-slate-200 bg-slate-100/80 p-5 sm:p-6">
            <div className="mb-5 max-w-2xl">
                <p className="mb-2 text-xs font-black tracking-widest text-cyan-500 uppercase">
                    Three products, one platform
                </p>
                <h2 className="text-2xl font-black tracking-tight text-blue-950 sm:text-3xl">
                    Built for fans who want signal, not noise
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                    Public model predictions and personal prediction games stay
                    clearly separate, so you always know what is AI and what is
                    yours.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {products.map((product) => (
                    <Link
                        key={product.title}
                        href={product.href}
                        className={[
                            'group flex min-h-64 flex-col justify-between rounded-xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg',
                            product.featured
                                ? 'border-cyan-300 shadow-cyan-900/5'
                                : 'border-slate-200',
                        ].join(' ')}
                    >
                        <div>
                            <div className="mb-8 flex items-start justify-between gap-4">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-950 text-white">
                                    <product.icon className="h-6 w-6" /> 
                                </span>
                                <span
                                    className={[
                                        'rounded-md px-3 py-1 text-[11px] font-black tracking-widest uppercase',
                                        product.featured
                                            ? 'bg-cyan-100 text-blue-950'
                                            : 'bg-slate-100 text-slate-500',
                                    ].join(' ')}
                                >
                                    {product.badge}
                                </span>
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-blue-950">
                                {product.title}
                            </h3>
                            <p className="mt-4 text-sm leading-6 text-slate-600">
                                {product.description}
                            </p>
                        </div>

                        <span
                            className={[
                                'mt-7 inline-flex items-center gap-2 text-sm font-black transition-colors',
                                product.featured
                                    ? 'text-cyan-500 group-hover:text-cyan-600'
                                    : 'text-blue-950 group-hover:text-cyan-600',
                            ].join(' ')}
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
