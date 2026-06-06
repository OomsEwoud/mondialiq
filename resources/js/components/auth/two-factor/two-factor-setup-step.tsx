import { Check, Copy } from 'lucide-react';
import AlertError from '@/components/shared/alert-error';
import { Spinner } from '@/components/ui/feedback/spinner';
import { Button } from '@/components/ui/forms/button';
import { useClipboard } from '@/hooks/use-clipboard';
import { settingsPrimaryButtonClassName } from '@/utils/settings-ui';

interface Props {
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    buttonText: string;
    onNextStep: () => void;
    errors: string[];
}

export default function TwoFactorSetupStep({
    qrCodeSvg,
    manualSetupKey,
    buttonText,
    onNextStep,
    errors,
}: Props) {
    const [copiedText, copy] = useClipboard();
    const hasErrors = errors.length > 0;
    const setupKey = manualSetupKey ?? '';
    const hasManualSetupKey = setupKey.length > 0;
    const IconComponent = copiedText === setupKey ? Check : Copy;
    const qrCodeMarkup = qrCodeSvg ?? '';
    const showQrCode = Boolean(qrCodeSvg);

    return (
        <>
            {hasErrors ? (
                <AlertError errors={errors} />
            ) : (
                <>
                    <div className="mx-auto flex max-w-md overflow-hidden">
                        <div className="mx-auto aspect-square w-64 rounded-lg border border-border">
                            <div className="z-10 flex h-full w-full items-center justify-center p-5">
                                {showQrCode ? (
                                    <div
                                        className="aspect-square w-full rounded-lg bg-white p-2 [&_svg]:size-full"
                                        dangerouslySetInnerHTML={{
                                            __html: qrCodeMarkup,
                                        }}
                                    />
                                ) : (
                                    <Spinner />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full space-x-5">
                        <Button
                            className={`w-full ${settingsPrimaryButtonClassName}`}
                            onClick={onNextStep}
                        >
                            {buttonText}
                        </Button>
                    </div>

                    <div className="relative flex w-full items-center justify-center">
                        <div className="absolute inset-0 top-1/2 h-px w-full bg-border" />
                        <span className="relative bg-card px-2 py-1">
                            or, enter the code manually
                        </span>
                    </div>

                    <div className="flex w-full space-x-2">
                        <div className="flex w-full items-stretch overflow-hidden rounded-xl border border-border">
                            {!hasManualSetupKey ? (
                                <div className="flex h-full w-full items-center justify-center bg-muted p-3">
                                    <Spinner />
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        readOnly
                                        value={setupKey}
                                        className="h-full w-full bg-background p-3 text-foreground outline-none"
                                    />
                                    <button
                                        type="button"
                                        aria-label="Copy manual setup key"
                                        onClick={() => copy(setupKey)}
                                        className="border-l border-border px-3 hover:bg-muted"
                                    >
                                        <IconComponent className="w-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
