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
        ? 'Bij het inloggen wordt om een code uit je authenticator-app gevraagd.'
        : 'Voeg bij het inloggen een extra controle met je authenticator-app toe.';
    const twoFactorBadgeClassName = twoFactorEnabled
        ? 'border-emerald-200 bg-emerald-950/40 text-emerald-200'
        : 'border-border bg-muted text-muted-foreground';
    const twoFactorBadgeLabel = twoFactorEnabled
        ? 'Ingeschakeld'
        : 'Uitgeschakeld';

    const openSetupModal = () => setShowSetupModal(true);
    const closeSetupModal = () => setShowSetupModal(false);

    return (
        <SettingsSection
            icon={ShieldCheck}
            eyebrow="Sign-in"
            title="Tweestapsverificatie"
            description="Beveilig je account met een extra inlogcontrole."
        >
            <div className="space-y-5">
                <div
                    className={`${settingsSubtlePanelClassName} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}
                >
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <LockKeyhole className="size-4 text-primary" />
                            <p className="text-sm font-bold text-foreground">
                                2FA status
                            </p>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
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
                                    className="w-full rounded-lg bg-red-600 font-semibold text-foreground shadow-sm hover:bg-red-700 sm:w-auto"
                                >
                                    2FA uitschakelen
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
                                Instellen voortzetten
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
                                        2FA inschakelen
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
