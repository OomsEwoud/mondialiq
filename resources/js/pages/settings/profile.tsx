import { Form, Link } from '@inertiajs/react';
import {
    KeyRound,
    LockKeyhole,
    MailWarning,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import EditAccountController from '@/actions/App/Http/Controllers/Settings/EditAccountController';
import UpdateAccountController from '@/actions/App/Http/Controllers/Settings/UpdateAccountController';
import UpdatePasswordController from '@/actions/App/Http/Controllers/Settings/UpdatePasswordController';
import PasswordInput from '@/components/auth/password/password-input';
import TwoFactorRecoveryCodes from '@/components/auth/two-factor/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/auth/two-factor/two-factor-setup-modal';
import InputError from '@/components/forms/input-error';
import PageHead from '@/components/seo/page-head';
import SettingsSection from '@/components/settings/settings-section';
import { Badge } from '@/components/ui/feedback/badge';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import AvatarCropper from '@/components/user/avatar-cropper';
import DeleteUser from '@/components/user/delete-user';
import ProfileAvatarField from '@/components/user/profile-avatar-field';
import { useAvatarUpload } from '@/hooks/use-avatar-upload';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';
import { send } from '@/routes/verification';
import type { AccountUser } from '@/types';
import {
    settingsFieldClassName,
    settingsLabelClassName,
    settingsPrimaryButtonClassName,
    settingsSubtlePanelClassName,
} from '@/utils/settings-ui';

type Props = {
    accountUser: AccountUser;
    mustVerifyEmail: boolean;
    status?: string;
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

const fieldErrorWrapperClassName = 'min-h-10';
const fieldErrorClassName = 'leading-5';
const emailVerificationCardClassName =
    'rounded-[1.5rem] border border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,1),rgba(253,230,138,0.5))] p-4 shadow-sm shadow-amber-950/5';

export default function Profile({
    accountUser,
    mustVerifyEmail,
    status,
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const avatarUpload = useAvatarUpload();

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    const user = accountUser;
    const isSsoOnly = user.is_sso_only;
    const needsEmailVerification =
        mustVerifyEmail && user.email_verified_at === null;
    const showTwoFactorSection = canManageTwoFactor && !isSsoOnly;
    const profileGridClassName = isSsoOnly
        ? 'grid items-start gap-5'
        : 'grid items-start gap-5 md:grid-cols-2';
    const twoFactorStatusText = twoFactorEnabled
        ? 'Your account asks for an authenticator code during login.'
        : 'Enable 2FA to require an authenticator code during login.';
    const twoFactorBadgeClassName = twoFactorEnabled
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-50 text-slate-600';
    const twoFactorBadgeLabel = twoFactorEnabled ? 'Enabled' : 'Not enabled';

    const openSetupModal = () => setShowSetupModal(true);
    const closeSetupModal = () => setShowSetupModal(false);

    return (
        <>
            <PageHead
                title="Profile settings"
                description="Manage your MondialIQ profile, email address, password, two-factor authentication and account safety settings."
                noIndex
            />

            <h1 className="sr-only">Profile settings</h1>

            <div className="min-w-0 space-y-6">
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
                                    avatarInputRef={
                                        avatarUpload.croppedAvatarInput
                                    }
                                    error={errors.avatar}
                                    onAvatarChange={
                                        avatarUpload.handleAvatarChange
                                    }
                                    previewUrl={avatarUpload.avatarPreview}
                                    selectedFileName={
                                        avatarUpload.selectedAvatarName
                                    }
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
                                        <div
                                            className={
                                                fieldErrorWrapperClassName
                                            }
                                        >
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
                                                className={
                                                    settingsLabelClassName
                                                }
                                            >
                                                Email address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                className={
                                                    settingsFieldClassName
                                                }
                                                defaultValue={user.email}
                                                name="email"
                                                autoComplete="username"
                                                placeholder="name@example.com"
                                            />
                                            <div
                                                className={
                                                    fieldErrorWrapperClassName
                                                }
                                            >
                                                <InputError
                                                    message={errors.email}
                                                    className={
                                                        fieldErrorClassName
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {needsEmailVerification && (
                                    <div
                                        className={
                                            emailVerificationCardClassName
                                        }
                                    >
                                        <div className="flex gap-3">
                                            <MailWarning className="mt-0.5 size-5 shrink-0 text-amber-600" />
                                            <div className="space-y-2">
                                                <p className="text-sm font-black text-amber-900">
                                                    Your email address is
                                                    unverified.
                                                </p>
                                                <p className="text-sm leading-6 text-amber-800">
                                                    Verify your email to keep
                                                    all account features
                                                    available.
                                                </p>
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-sm font-black text-blue-950 underline decoration-cyan-300 underline-offset-4 transition-colors hover:text-cyan-600"
                                                >
                                                    Resend verification email
                                                </Link>
                                                {status ===
                                                    'verification-link-sent' && (
                                                    <p className="text-sm font-semibold text-green-700">
                                                        A new verification link
                                                        has been sent.
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
                                        className={
                                            settingsPrimaryButtonClassName
                                        }
                                    >
                                        Save profile
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </SettingsSection>

                {!isSsoOnly && (
                    <SettingsSection
                        icon={KeyRound}
                        eyebrow="Password"
                        title="Update password"
                        description="Use at least 8 characters and avoid reused passwords."
                    >
                        <Form
                            {...UpdatePasswordController.form()}
                            options={{ preserveScroll: true }}
                            resetOnError={[
                                'password',
                                'password_confirmation',
                                'current_password',
                            ]}
                            resetOnSuccess
                            onError={(errors) => {
                                if (errors.password) {
                                    passwordInput.current?.focus();
                                }

                                if (errors.current_password) {
                                    currentPasswordInput.current?.focus();
                                }
                            }}
                            className="space-y-5"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="grid items-start gap-5 lg:grid-cols-3">
                                        <div className="flex min-w-0 flex-col gap-2">
                                            <Label
                                                htmlFor="current_password"
                                                className={
                                                    settingsLabelClassName
                                                }
                                            >
                                                Current password
                                            </Label>
                                            <PasswordInput
                                                id="current_password"
                                                ref={currentPasswordInput}
                                                name="current_password"
                                                className={
                                                    settingsFieldClassName
                                                }
                                                autoComplete="current-password"
                                                placeholder="************"
                                            />
                                            <div
                                                className={
                                                    fieldErrorWrapperClassName
                                                }
                                            >
                                                <InputError
                                                    message={
                                                        errors.current_password
                                                    }
                                                    className={
                                                        fieldErrorClassName
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="flex min-w-0 flex-col gap-2">
                                            <Label
                                                htmlFor="password"
                                                className={
                                                    settingsLabelClassName
                                                }
                                            >
                                                New password
                                            </Label>
                                            <PasswordInput
                                                id="password"
                                                ref={passwordInput}
                                                name="password"
                                                className={
                                                    settingsFieldClassName
                                                }
                                                autoComplete="new-password"
                                                placeholder="Min. 8 characters"
                                            />
                                            <div
                                                className={
                                                    fieldErrorWrapperClassName
                                                }
                                            >
                                                <InputError
                                                    message={errors.password}
                                                    className={
                                                        fieldErrorClassName
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="flex min-w-0 flex-col gap-2">
                                            <Label
                                                htmlFor="password_confirmation"
                                                className={
                                                    settingsLabelClassName
                                                }
                                            >
                                                Confirm password
                                            </Label>
                                            <PasswordInput
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                className={
                                                    settingsFieldClassName
                                                }
                                                autoComplete="new-password"
                                                placeholder="Repeat new password"
                                            />
                                            <div
                                                className={
                                                    fieldErrorWrapperClassName
                                                }
                                            >
                                                <InputError
                                                    message={
                                                        errors.password_confirmation
                                                    }
                                                    className={
                                                        fieldErrorClassName
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            disabled={processing}
                                            data-test="update-password-button"
                                            className={
                                                settingsPrimaryButtonClassName
                                            }
                                        >
                                            Save password
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </SettingsSection>
                )}

                {showTwoFactorSection && (
                    <SettingsSection
                        icon={ShieldCheck}
                        eyebrow="Sign-in"
                        title="Two-factor authentication"
                        description="Add an authenticator app check to protect your account."
                    >
                        <div className="space-y-5">
                            <div
                                className={`${settingsSubtlePanelClassName} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}
                            >
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <LockKeyhole className="size-4 text-cyan-500" />
                                        <p className="text-sm font-black text-blue-950">
                                            2FA status
                                        </p>
                                    </div>
                                    <p className="text-sm leading-6 text-slate-600">
                                        {twoFactorStatusText}
                                    </p>
                                </div>
                                <Badge
                                    className={twoFactorBadgeClassName}
                                    variant="outline"
                                >
                                    {twoFactorBadgeLabel}
                                </Badge>
                            </div>

                            {twoFactorEnabled ? (
                                <div className="space-y-4">
                                    <Form {...disable.form()}>
                                        {({ processing }) => (
                                            <Button
                                                variant="destructive"
                                                type="submit"
                                                disabled={processing}
                                                className="w-full rounded-2xl bg-red-600 font-black text-white shadow-lg shadow-red-950/15 hover:bg-red-700 sm:w-auto"
                                            >
                                                Disable 2FA
                                            </Button>
                                        )}
                                    </Form>

                                    <TwoFactorRecoveryCodes
                                        recoveryCodesList={recoveryCodesList}
                                        fetchRecoveryCodes={fetchRecoveryCodes}
                                        errors={errors}
                                    />
                                </div>
                            ) : (
                                <div>
                                    {hasSetupData ? (
                                        <Button
                                            onClick={openSetupModal}
                                            className={
                                                settingsPrimaryButtonClassName
                                            }
                                        >
                                            <ShieldCheck />
                                            Continue setup
                                        </Button>
                                    ) : (
                                        <Form
                                            {...enable.form()}
                                            onSuccess={openSetupModal}
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className={
                                                        settingsPrimaryButtonClassName
                                                    }
                                                >
                                                    Enable 2FA
                                                </Button>
                                            )}
                                        </Form>
                                    )}
                                </div>
                            )}

                            <TwoFactorSetupModal
                                isOpen={showSetupModal}
                                onClose={closeSetupModal}
                                requiresConfirmation={requiresConfirmation}
                                twoFactorEnabled={twoFactorEnabled}
                                qrCodeSvg={qrCodeSvg}
                                manualSetupKey={manualSetupKey}
                                clearSetupData={clearSetupData}
                                fetchSetupData={fetchSetupData}
                                errors={errors}
                            />
                        </div>
                    </SettingsSection>
                )}

                <DeleteUser user={user} />
            </div>

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

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: EditAccountController(),
        },
    ],
};
