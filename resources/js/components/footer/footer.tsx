import AppLogo from '@/components/app/app-logo';

export default function Footer() {
    return (
        <footer className="mt-12 w-full overflow-x-hidden border-t border-slate-200/80 bg-white/85 px-6 py-10 backdrop-blur">
            <div className="mx-auto w-full max-w-7xl min-w-0">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="col-span-1 md:col-span-2">
                        <div className="mb-4 flex items-center gap-2">
                            <AppLogo
                                markClassName="h-7 w-7 rounded-md text-xs shadow-none"
                                textClassName="text-lg"
                            />
                        </div>
                        <p className="max-w-xl text-sm leading-6 text-slate-600">
                            Our predictions are data-driven insights but remain
                            purely informational. MondialIQ has no affiliation
                            with gambling organizations or FIFA. Always play
                            responsibly and only with money you can afford to
                            lose.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <h4 className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                Timezone
                            </h4>
                            <p className="text-sm font-semibold text-slate-700">
                                Europe / Brussels (GMT+2)
                            </p>
                        </div>
                        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 px-4 py-3">
                            <h4 className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                Responsible Gaming
                            </h4>
                            <a
                                href="https://www.begambleaware.org"
                                target="_blank"
                                className="text-sm font-black text-cyan-800 hover:underline focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
                            >
                                BeGambleAware.org
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 md:flex-row">
                    <p className="text-xs text-slate-400">
                        © {new Date().getFullYear()} MondialIQ. All rights
                        reserved.
                    </p>
                    <div className="flex flex-wrap justify-center gap-5">
                        <a
                            href="#"
                            className="text-xs text-slate-400 transition-colors hover:text-slate-600"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="text-xs text-slate-400 transition-colors hover:text-slate-600"
                        >
                            Terms of Service
                        </a>
                        <a
                            href="#"
                            className="text-xs text-slate-400 transition-colors hover:text-slate-600"
                        >
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
