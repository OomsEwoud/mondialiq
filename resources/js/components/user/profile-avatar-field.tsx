import type { ChangeEvent, RefObject } from 'react';
import InputError from '@/components/forms/input-error';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

type ProfileAvatarFieldProps = {
    avatarInputRef: RefObject<HTMLInputElement | null>;
    error?: string;
    onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
    previewUrl: string | null;
    user: User;
};

export default function ProfileAvatarField({
    avatarInputRef,
    error,
    onAvatarChange,
    previewUrl,
    user,
}: ProfileAvatarFieldProps) {
    const getInitials = useInitials();
    const avatarSrc = previewUrl ?? user.avatar ?? undefined;

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
                <Avatar className="size-20 border-2 border-white shadow-sm ring-1 ring-slate-200">
                    <AvatarImage
                        src={avatarSrc}
                        alt={user.name}
                        className="object-cover"
                    />
                    <AvatarFallback className="bg-cyan-100 text-lg font-black text-blue-950">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-black text-blue-950">
                        Profile photo
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                        Upload a photo, crop it round, and choose exactly what
                        appears in your avatar.
                    </p>
                </div>
            </div>

            <div className="min-w-0 lg:w-80">
                <Label htmlFor="avatar" className="sr-only">
                    Profile photo
                </Label>
                <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="h-11 cursor-pointer rounded-lg border-slate-300 bg-white text-slate-900 shadow-none file:mr-3 file:cursor-pointer file:rounded-md file:bg-cyan-100 file:px-3 file:py-1 file:text-xs file:font-black file:text-blue-950 hover:file:bg-cyan-200 focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                    onChange={onAvatarChange}
                />
                <input
                    ref={avatarInputRef}
                    type="file"
                    name="avatar"
                    className="hidden"
                    tabIndex={-1}
                />
                <InputError message={error} className="mt-2 leading-5" />
            </div>
        </div>
    );
}
