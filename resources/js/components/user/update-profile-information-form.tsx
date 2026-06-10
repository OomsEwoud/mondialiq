import { Form, Link } from '@inertiajs/react';
import { MailWarning, UserRound } from 'lucide-react';

import UpdateAccountController from '@/actions/App/Http/Controllers/Settings/UpdateAccountController';
import InputError from '@/components/forms/input-error';
import SettingsSection from '@/components/settings/settings-section';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import AvatarCropper from '@/components/user/avatar-cropper';
import ProfileAvatarField from '@/components/user/profile-avatar-field';
import { useAvatarUpload } from '@/hooks/use-avatar-upload';
import { send } from '@/routes/verification';
import type { AccountUser } from '@/types';
import {
    settingsFieldClassName,
    settingsLabelClassName,
    settingsPrimaryButtonClassName,
} from '@/utils/settings-ui';

type Props = {
    user: AccountUser;
    isSsoOnly: boolean;
    needsEmailVerification: boolean;
    status?: string;
};

const fieldErrorWrapperClassName = 'min-h-10';
const fieldErrorClassName = 'leading-5';
const emailVerificationCardClassName =
    'rounded-xl border border-amber-200 bg-amber-50 p-4';

export default function UpdateProfileInformationForm({
    user,
    isSsoOnly,
    needsEmailVerification,
    status,
}: Props) {
    const avatarUpload = useAvatarUpload();
    const profileGridClassName = isSsoOnly
        ? 'grid items-start gap-5'
        : 'grid items-start gap-5 md:grid-cols-2';

    return (
        <>
            <SettingsSection
                icon={UserRound}
                eyebrow="Profile"
                title="Profile information"
                description={
                    isSsoOnly
                        ? 'Keep your display name up to date.'
                        : 'Keep your name and email address up to date.'
                }
            >
                <Form
                    {...UpdateAccountController.form()}
                    options={{ preserveScroll: true }}
                    encType="multipart/form-data"
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <ProfileAvatarField
                                avatarInputRef={avatarUpload.croppedAvatarInput}
                                error={errors.avatar}
                                onAvatarChange={avatarUpload.handleAvatarChange}
                                previewUrl={avatarUpload.avatarPreview}
                                selectedFileName={avatarUpload.selectedAvatarName}
                                user={user}
                            />

                            <div className={profileGridClassName}>
                                <div className="flex min-w-0 flex-col gap-2">
                                    <Label
                                        htmlFor="name"
                                        className={settingsLabelClassName}
                                    >
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        className={settingsFieldClassName}
                                        defaultValue={user.name}
                                        name="name"
                                        autoComplete="name"
                                        placeholder="Example User"
                                    />
                                    <div className={fieldErrorWrapperClassName}>
                                        <InputError
                                            message={errors.name}
                                            className={fieldErrorClassName}
                                        />
                                    </div>
                                </div>

                                {!isSsoOnly && (
                                    <div className="flex min-w-0 flex-col gap-2">
                                        <Label
                                            htmlFor="email"
                                            className={settingsLabelClassName}
                                        >
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            className={settingsFieldClassName}
                                            defaultValue={user.email}
                                            name="email"
                                            autoComplete="username"
                                            placeholder="name@example.com"
                                        />
                                        <div className={fieldErrorWrapperClassName}>
                                            <InputError
                                                message={errors.email}
                                                className={fieldErrorClassName}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {needsEmailVerification && (
                                <div className={emailVerificationCardClassName}>
                                    <div className="flex gap-3">
                                        <MailWarning className="mt-0.5 size-5 shrink-0 text-amber-600" />
                                        <div className="space-y-2">
                                            <p className="text-sm font-bold text-amber-900">
                                                Your email address is unverified.
                                            </p>
                                            <p className="text-sm leading-6 text-amber-700">
                                                Verify your email to keep all
                                                account features available.
                                            </p>
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-sm font-bold text-slate-900 underline decoration-cyan-300 underline-offset-4 transition-colors hover:text-cyan-600"
                                            >
                                                Resend verification email
                                            </Link>
                                            {status === 'verification-link-sent' && (
                                                <p className="text-sm font-semibold text-green-700">
                                                    A new verification link has
                                                    been sent.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                    className={settingsPrimaryButtonClassName}
                                >
                                    Save profile
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </SettingsSection>

            <AvatarCropper
                fileName={avatarUpload.selectedAvatarName}
                imageSrc={avatarUpload.cropperImage}
                open={avatarUpload.cropperOpen}
                onApply={avatarUpload.handleCroppedAvatar}
                onOpenChange={avatarUpload.setCropperOpen}
            />
        </>
    );
}
