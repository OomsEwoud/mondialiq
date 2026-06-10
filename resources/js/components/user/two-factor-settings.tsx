import { Form } from '@inertiajs/react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import TwoFactorRecoveryCodes from '@/components/auth/two-factor/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/auth/two-factor/two-factor-setup-modal';
import SettingsSection from '@/components/settings/settings-section';
import { Badge } from '@/components/ui/feedback/badge';
import { Button } from '@/components/ui/forms/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';
import {
    settingsPrimaryButtonClassName,
    settingsSubtlePanelClassName,
} from '@/utils/settings-ui';

type Props = {
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
};

export default function TwoFactorSettings({
    requiresConfirmation,
    twoFactorEnabled,
}: Props) {
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

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

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
                            <p className="text-sm font-bold text-slate-900">
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
                                    className="w-full rounded-lg bg-red-600 font-semibold text-white shadow-sm hover:bg-red-700 sm:w-auto"
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
                                className={settingsPrimaryButtonClassName}
                            >
                                <ShieldCheck />
                                Continue setup
                            </Button>
                        ) : (
                            <Form {...enable.form()} onSuccess={openSetupModal}>
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
    );
}
