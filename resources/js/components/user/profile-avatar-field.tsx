import type { ChangeEvent, RefObject } from 'react';
import { CheckCircle2, ImagePlus } from 'lucide-react';
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
}: ProfileAvatarFieldProps) {
    const getInitials = useInitials();
    const avatarSrc = previewUrl ?? user.avatar ?? undefined;
    const hasSelectedAvatar = Boolean(previewUrl);

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
                    className="sr-only"
                    onChange={onAvatarChange}
                />
                <label
                    htmlFor="avatar"
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition-colors focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-200 hover:border-cyan-300 hover:bg-cyan-50"
                >
                    <span className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-blue-950">
                            <ImagePlus className="size-5" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-sm font-black text-blue-950">
                                Choose image
                            </span>
                            <span className="block truncate text-xs font-semibold text-slate-500">
                                {hasSelectedAvatar
                                    ? selectedFileName
                                    : 'No image selected'}
                            </span>
                        </span>
                    </span>
                    {hasSelectedAvatar && (
                        <CheckCircle2 className="size-5 shrink-0 text-green-600" />
                    )}
                </label>
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
