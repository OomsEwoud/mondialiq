import type * as React from 'react';
import InputError from '@/components/forms/input-error';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

type Props = {
    avatarInputRef: React.RefObject<HTMLInputElement | null>;
    error?: string;
    onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    previewUrl: string | null;
    selectedFileName: string;
    user: User;
};

export default function ProfileAvatarField({
    avatarInputRef,
    error,
    onAvatarChange,
    previewUrl,
    selectedFileName,
    user,
}: Props) {
    const getInitials = useInitials();

    return (
        <div className="flex items-center gap-4">
            <Avatar className="size-16 shrink-0">
                <AvatarImage
                    src={previewUrl ?? user.avatar ?? undefined}
                    alt={user.name}
                    className="object-cover"
                />
                <AvatarFallback className="bg-surface-interactive text-lg">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
                <p className="truncate font-semibold">{user.name}</p>
                <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="peer sr-only"
                    onChange={onAvatarChange}
                    aria-label="Profielfoto wijzigen"
                />
                <label
                    htmlFor="avatar"
                    className="inline-flex min-h-10 cursor-pointer items-center rounded-sm text-sm text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring hover:underline"
                >
                    Foto wijzigen
                </label>
                {previewUrl && (
                    <p className="truncate text-xs text-muted-foreground">
                        {selectedFileName}
                    </p>
                )}
                <input
                    ref={avatarInputRef}
                    type="file"
                    name="avatar"
                    className="hidden"
                    tabIndex={-1}
                />
                <InputError message={error} />
            </div>
        </div>
    );
}
