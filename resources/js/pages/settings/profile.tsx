import { Eye } from 'lucide-react';
import EditAccountController from '@/actions/App/Http/Controllers/Settings/EditAccountController';
import PageHead from '@/components/seo/page-head';
import PredictionPreferencesSection from '@/components/settings/prediction-preferences-section';
import SettingsSection from '@/components/settings/settings-section';
import DeleteUser from '@/components/user/delete-user';
import TwoFactorSettings from '@/components/user/two-factor-settings';
import UpdatePasswordForm from '@/components/user/update-password-form';
import UpdateProfileInformationForm from '@/components/user/update-profile-information-form';
import type { AccountUser, PredictionPreferences } from '@/types';

type Props = {
    accountUser: AccountUser;
    predictionPreferences: PredictionPreferences;
    mustVerifyEmail: boolean;
    status?: string;
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function Profile({
    accountUser,
    predictionPreferences,
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
                title="Profile settings"
                description="Manage your MondialIQ profile, email address, password, two-factor authentication and account safety settings."
                noIndex
            />

            <h1 className="sr-only">Profile settings</h1>

            <div className="min-w-0 space-y-6">
                <UpdateProfileInformationForm
                    user={user}
                    isSsoOnly={isSsoOnly}
                    needsEmailVerification={
                        mustVerifyEmail && user.email_verified_at === null
                    }
                    status={status}
                />

                {!isSsoOnly && <UpdatePasswordForm />}

                {showTwoFactorSection && (
                    <TwoFactorSettings
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                    />
                )}

                <SettingsSection
                    icon={Eye}
                    eyebrow="Predictions"
                    title="Prediction Preferences"
                    description="Control how your predictions are shared across MondialIQ."
                >
                    <PredictionPreferencesSection
                        key={
                            predictionPreferences.predictions_visibility +
                            predictionPreferences.default_prediction_visibility +
                            (predictionPreferences.show_on_leaderboards
                                ? '1'
                                : '0') +
                            (predictionPreferences.allow_group_visibility
                                ? '1'
                                : '0')
                        }
                        preferences={predictionPreferences}
                    />
                </SettingsSection>

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
