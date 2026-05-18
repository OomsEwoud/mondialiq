import { Link, router } from '@inertiajs/react';
import { BarChart3, LogOut, Medal, UserRound } from 'lucide-react';
import EditAccountController from '@/actions/App/Http/Controllers/Settings/EditAccountController';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/forms/dropdown-menu';
import { UserInfo } from '@/components/user/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { leaderboards, logout, predictions } from '@/routes';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="rounded-lg bg-slate-50 px-3 py-3 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2 bg-slate-200" />
            <DropdownMenuGroup>
                <DropdownMenuItem
                    asChild
                    className="rounded-lg px-3 py-2 font-semibold text-blue-950 transition-colors focus:bg-cyan-50 focus:text-blue-950"
                >
                    <Link
                        className="flex w-full cursor-pointer items-center gap-2"
                        href={EditAccountController()}
                        prefetch
                        onClick={cleanup}
                    >
                        <UserRound className="size-4 text-cyan-500" />
                        Profile settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    asChild
                    className="rounded-lg px-3 py-2 font-semibold text-blue-950 transition-colors focus:bg-cyan-50 focus:text-blue-950"
                >
                    <Link
                        className="flex w-full cursor-pointer items-center gap-2"
                        href={predictions.url({ query: { mode: 'mine' } })}
                        prefetch
                        onClick={cleanup}
                    >
                        <BarChart3 className="size-4 text-cyan-500" />
                        My predictions
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    asChild
                    className="rounded-lg px-3 py-2 font-semibold text-blue-950 transition-colors focus:bg-cyan-50 focus:text-blue-950"
                >
                    <Link
                        className="flex w-full cursor-pointer items-center gap-2"
                        href={leaderboards()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Medal className="size-4 text-cyan-500" />
                        Leaderboards
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-2 bg-slate-200" />
            <DropdownMenuItem
                asChild
                className="rounded-lg px-3 py-2 font-semibold text-slate-600 transition-colors focus:bg-red-50 focus:text-red-600"
            >
                <Link
                    className="flex w-full cursor-pointer items-center gap-2"
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
