import { useCallback, useEffect, useState } from 'react';
import TwoFactorSetupIcon from '@/components/auth/two-factor/two-factor-setup-icon';
import TwoFactorSetupStep from '@/components/auth/two-factor/two-factor-setup-step';
import TwoFactorVerificationStep from '@/components/auth/two-factor/two-factor-verification-step';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/overlays/dialog';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    clearSetupData: () => void;
    fetchSetupData: () => Promise<void>;
    errors: string[];
};

export default function TwoFactorSetupModal({
    isOpen,
    onClose,
    requiresConfirmation,
    twoFactorEnabled,
    qrCodeSvg,
    manualSetupKey,
    clearSetupData,
    fetchSetupData,
    errors,
}: Props) {
    const [showVerificationStep, setShowVerificationStep] =
        useState<boolean>(false);
    const isCompleted = twoFactorEnabled;
    const title = isCompleted
        ? 'Two-factor authentication enabled'
        : showVerificationStep
          ? 'Verify authentication code'
          : 'Enable two-factor authentication';
    const description = isCompleted
        ? 'Two-factor authentication is now enabled. Scan the QR code or enter the setup key in your authenticator app.'
        : showVerificationStep
          ? 'Enter the 6-digit code from your authenticator app'
          : 'To finish enabling two-factor authentication, scan the QR code or enter the setup key in your authenticator app';
    const buttonText = isCompleted ? 'Close' : 'Continue';

    const resetModalState = useCallback(() => {
        setShowVerificationStep(false);
        clearSetupData();
    }, [clearSetupData]);

    const handleClose = useCallback(() => {
        resetModalState();
        onClose();
    }, [onClose, resetModalState]);

    const handleModalNextStep = useCallback(() => {
        if (requiresConfirmation) {
            setShowVerificationStep(true);

            return;
        }

        handleClose();
    }, [requiresConfirmation, handleClose]);

    useEffect(() => {
        if (isOpen && !qrCodeSvg) {
            void fetchSetupData();
        }
    }, [fetchSetupData, isOpen, qrCodeSvg]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex items-center justify-center">
                    <TwoFactorSetupIcon />
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="text-center">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-5">
                    {showVerificationStep ? (
                        <TwoFactorVerificationStep
                            onClose={handleClose}
                            onBack={() => setShowVerificationStep(false)}
                        />
                    ) : (
                        <TwoFactorSetupStep
                            qrCodeSvg={qrCodeSvg}
                            manualSetupKey={manualSetupKey}
                            buttonText={buttonText}
                            onNextStep={handleModalNextStep}
                            errors={errors}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
