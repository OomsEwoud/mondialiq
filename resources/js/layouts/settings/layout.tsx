import type { PropsWithChildren } from 'react';
import { settingsSectionClassName } from '@/utils/settings-ui';

export default function SettingsLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-w-0 space-y-6">
            <div className={settingsSectionClassName}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-black tracking-widest text-cyan-600 uppercase">
                            Account
                        </p>
                        <h1 className="text-2xl font-black tracking-tight text-blue-950 sm:text-3xl">
                            Settings
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Manage your profile and sign-in settings.
                        </p>
                    </div>

                    <span className="w-fit rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black tracking-wide text-cyan-700 uppercase">
                        Account settings
                    </span>
                </div>
            </div>

            <section className="min-w-0 space-y-6">{children}</section>
        </div>
    );
}
