import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-cyan-100">
                <AvatarImage
                    src={user.avatar ?? undefined}
                    alt={user.name}
                    className="object-cover"
                />
                <AvatarFallback className="rounded-lg bg-cyan-100 font-black text-blue-950">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-black text-blue-950">
                    {user.name}
                </span>
                {showEmail && (
                    <span className="truncate text-xs font-medium text-slate-500">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
