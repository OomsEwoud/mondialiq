import { Form } from '@inertiajs/react';
import { Eye, EyeOff, LockKeyhole, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import AlertError from '@/components/shared/alert-error';
import { Button } from '@/components/ui/forms/button';
import { regenerateRecoveryCodes } from '@/routes/two-factor';

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
    const canRegenerateCodes = recoveryCodesList.length > 0 && codesAreVisible;

    const toggleCodesVisibility = useCallback(async () => {
        if (!codesAreVisible && !recoveryCodesList.length) {
            await fetchRecoveryCodes();
        }

        setCodesAreVisible(!codesAreVisible);

        if (!codesAreVisible) {
            setTimeout(() => {
                codesSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            });
        }
    }, [codesAreVisible, recoveryCodesList.length, fetchRecoveryCodes]);

    useEffect(() => {
        if (!recoveryCodesList.length) {
            fetchRecoveryCodes();
        }
    }, [recoveryCodesList.length, fetchRecoveryCodes]);

    const RecoveryCodeIconComponent = codesAreVisible ? EyeOff : Eye;

    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4">
                <h3 className="flex items-center gap-2 text-sm font-black text-blue-950">
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
                    className="w-fit rounded-lg bg-blue-950 font-black text-white hover:bg-cyan-500 hover:text-blue-950"
                    aria-expanded={codesAreVisible}
                    aria-controls="recovery-codes-section"
                >
                    <RecoveryCodeIconComponent
                        className="size-4"
                        aria-hidden="true"
                    />
                    {codesAreVisible ? 'Hide' : 'View'} recovery codes
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
                                className="rounded-lg font-black"
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
                        <AlertError errors={errors} />
                    ) : (
                        <>
                            <div
                                ref={codesSectionRef}
                                className="grid gap-1 rounded-lg border border-slate-200 bg-white p-4 font-mono text-sm text-slate-800"
                                role="list"
                                aria-label="Recovery codes"
                            >
                                {recoveryCodesList.length ? (
                                    recoveryCodesList.map((code, index) => (
                                        <div
                                            key={index}
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
