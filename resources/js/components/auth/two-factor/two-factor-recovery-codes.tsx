import { Form, Link } from '@inertiajs/react';
import { Eye, EyeOff, LockKeyhole, RefreshCw } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import EditAccountController from '@/actions/App/Http/Controllers/Settings/EditAccountController';
import AlertError from '@/components/shared/alert-error';
import { Button } from '@/components/ui/forms/button';
import { PASSWORD_CONFIRMATION_REQUIRED_ERROR } from '@/hooks/use-two-factor-auth';
import { confirm as confirmPassword } from '@/routes/password';
import { regenerateRecoveryCodes } from '@/routes/two-factor';
import {
    settingsPrimaryButtonClassName,
    settingsSubtlePanelClassName,
} from '@/utils/settings-ui';

type Props = {
    recoveryCodesList: string[];
    fetchRecoveryCodes: () => Promise<void>;
    errors: string[];
};

export default function TwoFactorRecoveryCodes({
    recoveryCodesList,
    fetchRecoveryCodes,
    errors,
}: Props) {
    const [codesAreVisible, setCodesAreVisible] = useState<boolean>(false);
    const codesSectionRef = useRef<HTMLDivElement | null>(null);
    const hasRecoveryCodes = recoveryCodesList.length > 0;
    const canRegenerateCodes = hasRecoveryCodes && codesAreVisible;
    const needsPasswordConfirmation = errors.includes(
        PASSWORD_CONFIRMATION_REQUIRED_ERROR,
    );

    const toggleCodesVisibility = useCallback(async () => {
        if (!codesAreVisible && !hasRecoveryCodes) {
            await fetchRecoveryCodes();
        }

        const nextVisibility = !codesAreVisible;
        setCodesAreVisible(nextVisibility);

        if (nextVisibility) {
            setTimeout(() => {
                codesSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            });
        }
    }, [codesAreVisible, fetchRecoveryCodes, hasRecoveryCodes]);

    const RecoveryCodeIconComponent = codesAreVisible ? EyeOff : Eye;
    const recoveryToggleLabel = `${codesAreVisible ? 'Hide' : 'View'} recovery codes`;

    return (
        <div className={settingsSubtlePanelClassName}>
            <div className="mb-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <LockKeyhole
                        className="size-4 text-cyan-500"
                        aria-hidden="true"
                    />
                    Recovery codes
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                    Recovery codes let you regain access if you lose your 2FA
                    device. Store them in a secure password manager.
                </p>
            </div>

            <div className="flex flex-col gap-3 select-none sm:flex-row sm:items-center sm:justify-between">
                <Button
                    onClick={toggleCodesVisibility}
                    className={`w-fit ${settingsPrimaryButtonClassName}`}
                    aria-expanded={codesAreVisible}
                    aria-controls="recovery-codes-section"
                >
                    <RecoveryCodeIconComponent
                        className="size-4"
                        aria-hidden="true"
                    />
                    {recoveryToggleLabel}
                </Button>

                {canRegenerateCodes && (
                    <Form
                        {...regenerateRecoveryCodes.form()}
                        options={{ preserveScroll: true }}
                        onSuccess={fetchRecoveryCodes}
                    >
                        {({ processing }) => (
                            <Button
                                variant="secondary"
                                type="submit"
                                disabled={processing}
                                className="rounded-lg font-bold"
                                aria-describedby="regenerate-warning"
                            >
                                <RefreshCw /> Regenerate codes
                            </Button>
                        )}
                    </Form>
                )}
            </div>

            <div
                id="recovery-codes-section"
                className={`relative overflow-hidden transition-all duration-300 ${codesAreVisible ? 'h-auto opacity-100' : 'h-0 opacity-0'}`}
                aria-hidden={!codesAreVisible}
            >
                <div className="mt-3 space-y-3">
                    {errors?.length ? (
                        <div className="space-y-3">
                            <AlertError errors={errors} />

                            {needsPasswordConfirmation && (
                                <Button
                                    asChild
                                    className={settingsPrimaryButtonClassName}
                                >
                                    <Link
                                        href={confirmPassword({
                                            query: {
                                                intended:
                                                    EditAccountController.url(),
                                            },
                                        })}
                                    >
                                        Confirm password
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div
                                ref={codesSectionRef}
                                className="grid gap-1 rounded-lg border border-slate-200 bg-white p-4 font-mono text-sm text-slate-800"
                                role="list"
                                aria-label="Recovery codes"
                            >
                                {hasRecoveryCodes ? (
                                    recoveryCodesList.map((code) => (
                                        <div
                                            key={code}
                                            role="listitem"
                                            className="select-text"
                                        >
                                            {code}
                                        </div>
                                    ))
                                ) : (
                                    <div
                                        className="space-y-2"
                                        aria-label="Loading recovery codes"
                                    >
                                        {Array.from(
                                            { length: 8 },
                                            (_, index) => (
                                                <div
                                                    key={index}
                                                    className="h-4 animate-pulse rounded bg-slate-200"
                                                    aria-hidden="true"
                                                />
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>

                            <p
                                id="regenerate-warning"
                                className="text-xs leading-5 text-slate-500 select-none"
                            >
                                Each recovery code can be used once to access
                                your account. Regenerating codes replaces the
                                old set.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
