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
    'cursor-pointer rounded-lg px-3 py-2 font-semibold text-slate-700 transition-colors hover:bg-cyan-50 hover:text-slate-900 focus:bg-cyan-50 focus:text-slate-900';
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
                <div className="rounded-lg bg-slate-50 px-3 py-3">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2 bg-slate-100" />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild className={menuItemClassName}>
                    <Link
                        className={menuLinkClassName}
                        href={editAccount.url()}
                        prefetch
                        onClick={cleanup}
                    >
                        <UserRound className="size-4 text-cyan-600" />
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
                        <BarChart3 className="size-4 text-cyan-600" />
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
                        <Medal className="size-4 text-cyan-600" />
                        Leaderboards
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-2 bg-slate-100" />
            <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-lg px-3 py-2 font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600"
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
