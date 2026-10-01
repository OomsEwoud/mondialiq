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
            <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-border">
                <AvatarImage
                    src={user.avatar ?? undefined}
                    alt={user.name}
                    className="object-cover"
                />
                <AvatarFallback className="rounded-lg bg-accent font-bold text-foreground">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-foreground">
                    {user.name}
                </span>
                {showEmail && (
                    <span className="truncate text-xs font-medium text-muted-foreground">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
