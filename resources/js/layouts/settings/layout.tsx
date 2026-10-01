import type { PropsWithChildren } from 'react';
import { settingsSectionClassName } from '@/utils/settings-ui';

export default function SettingsLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-w-0 space-y-6">
            <div className={settingsSectionClassName}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-black tracking-widest text-primary uppercase">
                            Account
                        </p>
                        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                            Settings
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            Manage your profile and sign-in settings.
                        </p>
                    </div>

                    <span className="w-fit rounded-full border border-border bg-accent px-3 py-1 text-xs font-black tracking-wide text-primary uppercase">
                        Account settings
                    </span>
                </div>
            </div>

            <section className="min-w-0 space-y-6">{children}</section>
        </div>
    );
}
