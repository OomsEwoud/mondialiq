import AppLogo from '@/components/app/app-logo';
import { contact, privacy } from '@/routes';

declare global {
    interface Window {
        Atbound?: {
            showConsentBanner: () => void;
        };
    }
}

export default function Footer() {
    const openCookieBanner = (): void => {
        if (
            typeof window !== 'undefined' &&
            window.Atbound?.showConsentBanner
        ) {
            window.Atbound.showConsentBanner();
        }
    };

    return (
        <footer className="mt-12 w-full overflow-x-hidden border-t border-slate-200 bg-white px-6 py-10">
            <div className="mx-auto w-full max-w-5xl min-w-0">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="col-span-1 md:col-span-2">
                        <div className="mb-4 flex items-center gap-2">
                            <AppLogo
                                markClassName="h-7 w-7 rounded-lg text-xs shadow-none"
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
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                            <h4 className="mb-1 text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                Timezone
                            </h4>
                            <p className="text-sm font-semibold text-slate-600">
                                Europe / Brussels (GMT+2)
                            </p>
                        </div>
                        <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3">
                            <h4 className="mb-1 text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                                Responsible Gaming
                            </h4>
                            <a
                                href="https://www.begambleaware.org"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-slate-600 hover:underline focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
                            >
                                BeGambleAware.org
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 md:flex-row">
                    <p className="text-xs text-slate-600">
                        &copy; {new Date().getFullYear()} MondialIQ. All rights
                        reserved.
                    </p>
                    <div className="flex flex-wrap justify-center gap-5">
                        <a
                            href={privacy.url()}
                            className="text-xs text-slate-600 transition-colors hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
                        >
                            Privacy & Cookie Policy
                        </a>
                        <button
                            type="button"
                            onClick={openCookieBanner}
                            className="text-xs text-slate-600 transition-colors hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
                        >
                            Cookie Preferences
                        </button>
                        <a
                            href={contact.url()}
                            className="text-xs text-slate-600 transition-colors hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
                        >
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
