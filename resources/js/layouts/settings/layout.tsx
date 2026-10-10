import type { PropsWithChildren } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
    return (
        <div className="max-w-2xl min-w-0">
            <header className="mb-8">
                <h1 className="mq-page-title">Instellingen</h1>
                <p className="mt-3 text-sm text-muted-foreground">
                    Beheer je profiel en account.
                </p>
            </header>
            {children}
        </div>
    );
}
