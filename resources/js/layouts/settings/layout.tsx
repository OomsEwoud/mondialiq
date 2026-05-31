import { Link } from '@inertiajs/react';
import { UserRound } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import EditAccountController from '@/actions/App/Http/Controllers/Settings/EditAccountController';
import { Button } from '@/components/ui/forms/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';
import { settingsSectionClassName } from '@/utils/settings-ui';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: EditAccountController(),
        icon: UserRound,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="min-w-0 space-y-6">
            <div className={settingsSectionClassName}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-black tracking-widest text-cyan-500 uppercase">
                            Account
                        </p>
                        <h1 className="text-3xl font-black tracking-tight text-blue-950">
                            Settings
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Manage your profile and sign-in settings.
                        </p>
                    </div>

                    <nav
                        className="flex flex-wrap gap-2"
                        aria-label="Settings sections"
                    >
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn(
                                    'h-9 rounded-lg px-3 font-black text-slate-600 hover:bg-cyan-50 hover:text-blue-950',
                                    {
                                        'bg-blue-950 text-white hover:bg-blue-950 hover:text-white':
                                            isCurrentOrParentUrl(item.href),
                                    },
                                )}
                            >
                                <Link href={item.href} className="gap-2">
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </div>
            </div>

            <section className="min-w-0 space-y-6">{children}</section>
        </div>
    );
}
