import { Form } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/forms/input-error';
import { Button } from '@/components/ui/forms/button';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/forms/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { confirm } from '@/routes/two-factor';
import { settingsPrimaryButtonClassName } from '@/utils/settings-ui';

interface Props {
    onClose: () => void;
    onBack: () => void;
}

export default function TwoFactorVerificationStep({ onClose, onBack }: Props) {
    const [code, setCode] = useState<string>('');
    const pinInputContainerRef = useRef<HTMLDivElement>(null);
    const isCodeComplete = code.length === OTP_MAX_LENGTH;
    const otpSlots = Array.from(
        { length: OTP_MAX_LENGTH },
        (_, index) => index,
    );

    useEffect(() => {
        const animationFrame = requestAnimationFrame(() => {
            pinInputContainerRef.current?.querySelector('input')?.focus();
        });

        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <Form
            {...confirm.form()}
            onSuccess={() => onClose()}
            resetOnError
            resetOnSuccess
        >
            {({
                processing,
                errors,
            }: {
                processing: boolean;
                errors?: { confirmTwoFactorAuthentication?: { code?: string } };
            }) => (
                <div
                    ref={pinInputContainerRef}
                    className="relative w-full space-y-3"
                >
                    <div className="flex w-full flex-col items-center space-y-3 py-2">
                        <InputOTP
                            id="otp"
                            name="code"
                            maxLength={OTP_MAX_LENGTH}
                            onChange={setCode}
                            disabled={processing}
                            pattern={REGEXP_ONLY_DIGITS}
                        >
                            <InputOTPGroup>
                                {otpSlots.map((index) => (
                                    <InputOTPSlot key={index} index={index} />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                        <InputError
                            message={
                                errors?.confirmTwoFactorAuthentication?.code
                            }
                        />
                    </div>

                    <div className="flex w-full space-x-5">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onBack}
                            disabled={processing}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            className={`flex-1 ${settingsPrimaryButtonClassName}`}
                            disabled={processing || !isCodeComplete}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}
