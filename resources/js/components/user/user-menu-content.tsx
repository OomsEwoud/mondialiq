import { Link, router } from '@inertiajs/react';
import { BarChart3, LogOut, UsersRound, UserRound } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/forms/dropdown-menu';
import { UserInfo } from '@/components/user/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { editAccount, social, logout, predictions } from '@/routes';
import type { User } from '@/types';

type Props = {
    user: User;
};

const menuItemClassName =
    'min-h-10 cursor-pointer rounded-md px-3 py-2 font-medium text-text-secondary transition-colors focus:bg-surface-interactive focus:text-foreground data-[highlighted]:bg-surface-interactive data-[highlighted]:text-foreground';
const menuLinkClassName = 'flex w-full cursor-pointer items-center gap-2.5';

export const accountMenuClassName =
    'w-56 max-w-[calc(100vw-2rem)] rounded-xl border-border-subtle bg-surface-elevated p-1.5 text-foreground shadow-xl shadow-black/20';

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="flex min-w-0 items-center gap-2.5 px-3 py-3 font-normal [&_[data-slot=avatar]]:size-7 [&_[data-slot=avatar]]:shrink-0 [&_[data-slot=avatar]]:border-0 [&>div]:min-w-0">
                <UserInfo user={user} />
            </DropdownMenuLabel>
            <DropdownMenuGroup>
                <DropdownMenuItem asChild className={menuItemClassName}>
                    <Link
                        className={menuLinkClassName}
                        href={editAccount.url()}
                        prefetch
                        onClick={cleanup}
                    >
                        <UserRound className="size-3.5 text-muted-foreground" />
                        Profielinstellingen
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={menuItemClassName}>
                    <Link
                        className={menuLinkClassName}
                        href={predictions.url({ query: { mode: 'mine' } })}
                        prefetch
                        onClick={cleanup}
                    >
                        <BarChart3 className="size-3.5 text-muted-foreground" />
                        Mijn voorspellingen
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={menuItemClassName}>
                    <Link
                        className={menuLinkClassName}
                        href={social.url()}
                        prefetch
                        onClick={cleanup}
                    >
                        <UsersRound className="size-3.5 text-muted-foreground" />
                        Social
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="mx-3 my-1.5 bg-border-subtle" />
            <DropdownMenuItem
                asChild
                className="min-h-10 cursor-pointer rounded-md px-3 py-2 font-normal text-muted-foreground transition-colors focus:bg-destructive/10 focus:text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
            >
                <Link
                    className={menuLinkClassName}
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="size-3.5 text-current" />
                    Uitloggen
                </Link>
            </DropdownMenuItem>
        </>
    );
}
