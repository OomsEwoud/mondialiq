import { HttpResponseError } from '@inertiajs/core';
import { useHttp } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { qrCode, recoveryCodes, secretKey } from '@/routes/two-factor';

export type UseTwoFactorAuthReturn = {
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    recoveryCodesList: string[];
    hasSetupData: boolean;
    errors: string[];
    clearErrors: () => void;
    clearSetupData: () => void;
    clearTwoFactorAuthData: () => void;
    fetchQrCode: () => Promise<void>;
    fetchSetupKey: () => Promise<void>;
    fetchSetupData: () => Promise<void>;
    fetchRecoveryCodes: () => Promise<void>;
};

export const OTP_MAX_LENGTH = 6;
export const PASSWORD_CONFIRMATION_REQUIRED_ERROR =
    'Confirm your password before viewing recovery codes.';

export const useTwoFactorAuth = (): UseTwoFactorAuthReturn => {
    const { submit } = useHttp();

    const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
    const [manualSetupKey, setManualSetupKey] = useState<string | null>(null);
    const [recoveryCodesList, setRecoveryCodesList] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>([]);

    const hasSetupData = qrCodeSvg !== null && manualSetupKey !== null;
    const clearSetupState = useCallback((): void => {
        setManualSetupKey(null);
        setQrCodeSvg(null);
    }, []);
    const setGenericError = useCallback((message: string): void => {
        setErrors([message]);
    }, []);

    const clearErrors = useCallback((): void => {
        setErrors([]);
    }, []);

    const clearSetupData = useCallback((): void => {
        clearSetupState();
        setErrors([]);
    }, [clearSetupState]);

    const clearTwoFactorAuthData = useCallback((): void => {
        clearSetupState();
        setErrors([]);
        setRecoveryCodesList([]);
    }, [clearSetupState]);

    const fetchQrCode = useCallback(async (): Promise<void> => {
        try {
            const { svg } = (await submit(qrCode())) as {
                svg: string;
                url: string;
            };

            setQrCodeSvg(svg);
        } catch {
            setGenericError('Failed to fetch QR code');
            setQrCodeSvg(null);
        }
    }, [setGenericError, submit]);

    const fetchSetupKey = useCallback(async (): Promise<void> => {
        try {
            const { secretKey: key } = (await submit(secretKey())) as {
                secretKey: string;
            };

            setManualSetupKey(key);
        } catch {
            setGenericError('Failed to fetch a setup key');
            setManualSetupKey(null);
        }
    }, [setGenericError, submit]);

    const fetchRecoveryCodes = useCallback(async (): Promise<void> => {
        try {
            setErrors([]);
            const codes = (await submit(recoveryCodes())) as string[];
            setRecoveryCodesList(codes);
        } catch (error) {
            if (
                error instanceof HttpResponseError &&
                error.response.status === 423
            ) {
                setErrors([PASSWORD_CONFIRMATION_REQUIRED_ERROR]);

                return;
            }

            setGenericError('Failed to fetch recovery codes');
            setRecoveryCodesList([]);
        }
    }, [setGenericError, submit]);

    const fetchSetupData = useCallback(async (): Promise<void> => {
        try {
            setErrors([]);
            await Promise.all([fetchQrCode(), fetchSetupKey()]);
        } catch {
            clearSetupState();
        }
    }, [clearSetupState, fetchQrCode, fetchSetupKey]);

    return {
        qrCodeSvg,
        manualSetupKey,
        recoveryCodesList,
        hasSetupData,
        errors,
        clearErrors,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchQrCode,
        fetchSetupKey,
        fetchSetupData,
        fetchRecoveryCodes,
    };
};
