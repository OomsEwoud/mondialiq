import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/feedback/sonner';
import { TooltipProvider } from '@/components/ui/overlays/tooltip';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const configuredAppName = import.meta.env.VITE_APP_NAME;
const appName =
    configuredAppName && configuredAppName !== 'Laravel'
        ? configuredAppName
        : 'MondialIQ';

if (typeof window !== 'undefined' && window.location.hash === '#_=_') {
    window.history.replaceState(
        null,
        window.document.title,
        window.location.pathname + window.location.search,
    );
}

createInertiaApp({
    title: (title) =>
        title
            ? title.includes(appName)
                ? title
                : `${title} | ${appName}`
            : appName,
    layout: (name) => {
        switch (true) {
            case name === 'error':
                return null;
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
