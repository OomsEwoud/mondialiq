import { Link, router } from '@inertiajs/react';
import { BarChart3, LogOut, Medal, UserRound } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/forms/dropdown-menu';
import { UserInfo } from '@/components/user/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { editAccount, leaderboards, logout, predictions } from '@/routes';
import type { User } from '@/types';

type Props = {
    user: User;
};

const menuItemClassName =
    'cursor-pointer rounded-lg px-3 py-2 font-semibold text-foreground transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground';
const menuLinkClassName = 'flex w-full cursor-pointer items-center gap-2.5';

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="rounded-lg bg-muted px-3 py-3">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2 bg-muted" />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild className={menuItemClassName}>
                    <Link
                        className={menuLinkClassName}
                        href={editAccount.url()}
                        prefetch
                        onClick={cleanup}
                    >
                        <UserRound className="size-4 text-primary" />
                        Profile settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={menuItemClassName}>
                    <Link
                        className={menuLinkClassName}
                        href={predictions.url({ query: { mode: 'mine' } })}
                        prefetch
                        onClick={cleanup}
                    >
                        <BarChart3 className="size-4 text-primary" />
                        My predictions
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={menuItemClassName}>
                    <Link
                        className={menuLinkClassName}
                        href={leaderboards.url()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Medal className="size-4 text-primary" />
                        Leaderboards
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-2 bg-muted" />
            <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-lg px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-red-950/40 hover:text-destructive focus:bg-red-950/40 focus:text-destructive"
            >
                <Link
                    className={menuLinkClassName}
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="size-4" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
