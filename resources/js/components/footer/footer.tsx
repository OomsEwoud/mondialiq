export default function Footer() {
    return (
        <footer className="mt-12 border-t border-slate-200 bg-white py-12 px-6">
            <div className="mx-auto max-w-5xl">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                             <div className="rounded bg-cyan-500 p-1 text-xs font-bold text-white">MI</div>
                             <span className="text-lg font-bold text-slate-900">Mondial<span className="text-cyan-500">IQ</span></span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-500 max-w-md">
                            Our predictions are data-driven insights but remain purely informational. 
                            MondialIQ has no affiliation with gambling organizations or FIFA. 
                            Always play responsibly and only with money you can afford to lose.
                        </p>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Timezone</h4>
                            <p className="text-sm text-slate-600">Europe / Brussels (GMT+2)</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Responsible Gaming</h4>
                            <a href="https://www.begambleaware.org" target="_blank" className="text-sm text-cyan-600 hover:underline">
                                BeGambleAware.org
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-400">
                        © {new Date().getFullYear()} MondialIQ. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Terms of Service</a>
                        <a href="#" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}