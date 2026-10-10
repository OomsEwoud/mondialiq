import EditAccountController from '@/actions/App/Http/Controllers/Settings/EditAccountController';
import PageHead from '@/components/seo/page-head';
import DeleteUser from '@/components/user/delete-user';
import TwoFactorSettings from '@/components/user/two-factor-settings';
import UpdatePasswordForm from '@/components/user/update-password-form';
import UpdateProfileInformationForm from '@/components/user/update-profile-information-form';
import type { AccountUser } from '@/types';

type Props = {
    accountUser: AccountUser;
    mustVerifyEmail: boolean;
    status?: string;
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function Profile({
    accountUser,
    mustVerifyEmail,
    status,
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const user = accountUser;
    const isSsoOnly = user.is_sso_only;
    const showTwoFactorSection = canManageTwoFactor && !isSsoOnly;

    return (
        <>
            <PageHead
                title="Instellingen"
                description="Beheer je MondialIQ-profiel en account."
                noIndex
            />

            <div className="min-w-0 space-y-6">
                <UpdateProfileInformationForm
                    user={user}
                    isSsoOnly={isSsoOnly}
                    needsEmailVerification={
                        mustVerifyEmail && user.email_verified_at === null
                    }
                    status={status}
                />

                {!isSsoOnly && (
                    <details className="group border-t border-border-subtle py-5">
                        <summary className="cursor-pointer text-sm font-medium">
                            Wachtwoord wijzigen
                        </summary>
                        <div className="pt-5">
                            <UpdatePasswordForm />
                        </div>
                    </details>
                )}

                {showTwoFactorSection && (
                    <TwoFactorSettings
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                    />
                )}

                <DeleteUser user={user} />
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
