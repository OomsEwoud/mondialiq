import { Form, Head, Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    KeyRound,
    LockKeyhole,
    MailWarning,
    Shield,
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
import { Badge } from '@/components/ui/feedback/badge';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import DeleteUser from '@/components/user/delete-user';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';
import { send } from '@/routes/verification';

type Props = {
    mustVerifyEmail: boolean;
    status?: string;
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

type SettingsSectionProps = {
    icon: LucideIcon;
    eyebrow: string;
    title: string;
    description: string;
    children: React.ReactNode;
};

const fieldClassName =
    'h-11 rounded-lg border-slate-300 bg-white text-slate-900 shadow-none placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-200';

function SettingsSection({
    icon: Icon,
    eyebrow,
    title,
    description,
    children,
}: SettingsSectionProps) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-blue-950">
                        <Icon className="size-5" />
                    </span>
                    <div>
                        <p className="mb-1 text-xs font-black tracking-widest text-cyan-500 uppercase">
                            {eyebrow}
                        </p>
                        <h2 className="text-xl font-black tracking-tight text-blue-950">
                            {title}
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
            {children}
        </section>
    );
}

export default function Profile({
    mustVerifyEmail,
    status,
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const { auth } = usePage().props;
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

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

    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    if (!auth.user) {
        return null;
    }

    const user = auth.user;
    const isSsoOnly = user.is_sso_only;

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
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
                        className="space-y-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div
                                    className={
                                        isSsoOnly
                                            ? 'grid items-start gap-5'
                                            : 'grid items-start gap-5 md:grid-cols-2'
                                    }
                                >
                                    <div className="flex min-w-0 flex-col gap-2">
                                        <Label
                                            htmlFor="name"
                                            className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                        >
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            className={fieldClassName}
                                            defaultValue={user.name}
                                            name="name"
                                            autoComplete="name"
                                            placeholder="Example User"
                                        />
                                        <div className="min-h-10">
                                            <InputError
                                                message={errors.name}
                                                className="leading-5"
                                            />
                                        </div>
                                    </div>

                                    {!isSsoOnly && (
                                        <div className="flex min-w-0 flex-col gap-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                            >
                                                Email address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                className={fieldClassName}
                                                defaultValue={user.email}
                                                name="email"
                                                autoComplete="username"
                                                placeholder="name@example.com"
                                            />
                                            <div className="min-h-10">
                                                <InputError
                                                    message={errors.email}
                                                    className="leading-5"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {isSsoOnly && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
                                                    Email address
                                                </p>
                                                <p className="mt-1 text-sm font-black text-blue-950">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <Badge
                                                className="border-cyan-200 bg-white text-cyan-700"
                                                variant="outline"
                                            >
                                                Managed by{' '}
                                                {user.social_provider ??
                                                    'provider'}
                                            </Badge>
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-slate-600">
                                            Your email address is managed by
                                            your sign-in provider. Change it in
                                            Google or Facebook to keep your SSO
                                            account linked correctly.
                                        </p>
                                    </div>
                                )}

                                {mustVerifyEmail &&
                                    user.email_verified_at === null && (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                            <div className="flex gap-3">
                                                <MailWarning className="mt-0.5 size-5 shrink-0 text-amber-600" />
                                                <div className="space-y-2">
                                                    <p className="text-sm font-black text-amber-900">
                                                        Your email address is
                                                        unverified.
                                                    </p>
                                                    <p className="text-sm leading-6 text-amber-800">
                                                        Verify your email to
                                                        keep all account
                                                        features available.
                                                    </p>
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="text-sm font-black text-blue-950 underline decoration-cyan-300 underline-offset-4 transition-colors hover:text-cyan-600"
                                                    >
                                                        Resend verification
                                                        email
                                                    </Link>
                                                    {status ===
                                                        'verification-link-sent' && (
                                                        <p className="text-sm font-semibold text-green-700">
                                                            A new verification
                                                            link has been sent.
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
                                        className="h-11 rounded-lg bg-blue-950 px-5 font-black text-white hover:bg-cyan-500 hover:text-blue-950"
                                    >
                                        Save profile
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </SettingsSection>

                {isSsoOnly ? (
                    <SettingsSection
                        icon={Shield}
                        eyebrow="Security"
                        title="External sign-in"
                        description="Your account uses Google or Facebook for authentication."
                    >
                        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-black text-blue-950">
                                        Protected by your sign-in provider
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        MondialIQ does not store a local
                                        password for this account. Password and
                                        two-factor settings are managed through
                                        Google or Facebook.
                                    </p>
                                </div>
                                <Badge
                                    className="border-cyan-200 bg-white text-cyan-700"
                                    variant="outline"
                                >
                                    SSO only
                                </Badge>
                            </div>
                        </div>
                    </SettingsSection>
                ) : (
                    <SettingsSection
                        icon={KeyRound}
                        eyebrow="Password"
                        title="Update password"
                        description="Use a strong password that you do not reuse anywhere else."
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
                                                className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                            >
                                                Current password
                                            </Label>
                                            <PasswordInput
                                                id="current_password"
                                                ref={currentPasswordInput}
                                                name="current_password"
                                                className={fieldClassName}
                                                autoComplete="current-password"
                                                placeholder="••••••••••••"
                                            />
                                            <div className="min-h-10">
                                                <InputError
                                                    message={
                                                        errors.current_password
                                                    }
                                                    className="leading-5"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex min-w-0 flex-col gap-2">
                                            <Label
                                                htmlFor="password"
                                                className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                            >
                                                New password
                                            </Label>
                                            <PasswordInput
                                                id="password"
                                                ref={passwordInput}
                                                name="password"
                                                className={fieldClassName}
                                                autoComplete="new-password"
                                                placeholder="Min. 8 characters"
                                            />
                                            <div className="min-h-10">
                                                <InputError
                                                    message={errors.password}
                                                    className="leading-5"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex min-w-0 flex-col gap-2">
                                            <Label
                                                htmlFor="password_confirmation"
                                                className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                            >
                                                Confirm password
                                            </Label>
                                            <PasswordInput
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                className={fieldClassName}
                                                autoComplete="new-password"
                                                placeholder="Repeat new password"
                                            />
                                            <div className="min-h-10">
                                                <InputError
                                                    message={
                                                        errors.password_confirmation
                                                    }
                                                    className="leading-5"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            disabled={processing}
                                            data-test="update-password-button"
                                            className="h-11 rounded-lg bg-blue-950 px-5 font-black text-white hover:bg-cyan-500 hover:text-blue-950"
                                        >
                                            Save password
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </SettingsSection>
                )}

                {canManageTwoFactor && !isSsoOnly && (
                    <SettingsSection
                        icon={ShieldCheck}
                        eyebrow="Sign-in"
                        title="Two-factor authentication"
                        description="Add an authenticator app check to protect your account."
                    >
                        <div className="space-y-5">
                            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <LockKeyhole className="size-4 text-cyan-500" />
                                        <p className="text-sm font-black text-blue-950">
                                            2FA status
                                        </p>
                                    </div>
                                    <p className="text-sm leading-6 text-slate-600">
                                        {twoFactorEnabled
                                            ? 'Your account asks for an authenticator code during login.'
                                            : 'Enable 2FA to require an authenticator code during login.'}
                                    </p>
                                </div>
                                <Badge
                                    className={
                                        twoFactorEnabled
                                            ? 'border-green-200 bg-green-50 text-green-700'
                                            : 'border-slate-200 bg-white text-slate-600'
                                    }
                                    variant="outline"
                                >
                                    {twoFactorEnabled
                                        ? 'Enabled'
                                        : 'Not enabled'}
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
                                                className="rounded-lg font-black"
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
                                            onClick={() =>
                                                setShowSetupModal(true)
                                            }
                                            className="h-11 rounded-lg bg-blue-950 px-5 font-black text-white hover:bg-cyan-500 hover:text-blue-950"
                                        >
                                            <ShieldCheck />
                                            Continue setup
                                        </Button>
                                    ) : (
                                        <Form
                                            {...enable.form()}
                                            onSuccess={() =>
                                                setShowSetupModal(true)
                                            }
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="h-11 rounded-lg bg-blue-950 px-5 font-black text-white hover:bg-cyan-500 hover:text-blue-950"
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
                                onClose={() => setShowSetupModal(false)}
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

                <DeleteUser />
            </div>
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
