import { Form, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useState } from 'react';
import InputError from '@/components/forms/input-error';
import PageHead from '@/components/seo/page-head';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/forms/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';
import {
    authInputClass,
    authLinkClass,
    authPrimaryButtonClass,
} from '@/utils/auth-form';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');
    const title = showRecoveryInput ? 'Recovery code' : 'Authentication code';
    const description = showRecoveryInput
        ? 'Please confirm access to your account by entering one of your emergency recovery codes.'
        : 'Enter the authentication code provided by your authenticator application.';
    const toggleText = showRecoveryInput
        ? 'login using an authentication code'
        : 'login using a recovery code';

    setLayoutProps({
        title,
        description,
    });

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput((current) => !current);
        clearErrors();
        setCode('');
    };

    return (
        <>
            <PageHead
                title="Two-factor authentication"
                description="Complete two-factor authentication to securely access your MondialIQ account."
                noIndex
            />

            <div className="space-y-6">
                <Form
                    {...store.form()}
                    className="space-y-4"
                    resetOnError
                    resetOnSuccess={!showRecoveryInput}
                >
                    {({ errors, processing, clearErrors }) => (
                        <>
                            {showRecoveryInput ? (
                                <>
                                    <Input
                                        name="recovery_code"
                                        type="text"
                                        placeholder="ABCD-1234-EFGH"
                                        autoFocus={showRecoveryInput}
                                        required
                                        className={authInputClass}
                                    />
                                    <InputError
                                        message={errors.recovery_code}
                                    />
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                    <div className="flex w-full items-center justify-center">
                                        <InputOTP
                                            name="code"
                                            maxLength={OTP_MAX_LENGTH}
                                            value={code}
                                            onChange={(value) => setCode(value)}
                                            disabled={processing}
                                            pattern={REGEXP_ONLY_DIGITS}
                                        >
                                            <InputOTPGroup>
                                                {Array.from(
                                                    { length: OTP_MAX_LENGTH },
                                                    (_, index) => (
                                                        <InputOTPSlot
                                                            key={index}
                                                            index={index}
                                                            className="size-11 border-[#343b37] bg-[#171c19] text-base text-white first:rounded-l-xl last:rounded-r-xl"
                                                        />
                                                    ),
                                                )}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <InputError message={errors.code} />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className={authPrimaryButtonClass}
                                disabled={processing}
                            >
                                Continue
                            </Button>

                            <div className="text-center text-sm text-[#7f8882]">
                                <span>or you can </span>
                                <button
                                    type="button"
                                    className={authLinkClass}
                                    onClick={() =>
                                        toggleRecoveryMode(clearErrors)
                                    }
                                >
                                    {toggleText}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
