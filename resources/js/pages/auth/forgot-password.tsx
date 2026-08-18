import { Form } from '@inertiajs/react';
import InputError from '@/components/forms/input-error';
import PageHead from '@/components/seo/page-head';
import TextLink from '@/components/typography/text-link';
import { Spinner } from '@/components/ui/feedback/spinner';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { login } from '@/routes';
import { email } from '@/routes/password';
import {
    authFieldLabelClass,
    authInputClass,
    authLinkClass,
    authMutedPanelClass,
    authPrimaryButtonClass,
    authStatusMessageClass,
} from '@/utils/auth-form';

export default function ForgotPassword({ status }: { status?: string }) {
    const showStatus = Boolean(status);

    return (
        <>
            <PageHead
                title="Wachtwoord vergeten"
                description="Vraag veilig een link aan om je MondialiQ-wachtwoord opnieuw in te stellen."
                noIndex
            />

            {showStatus && (
                <div className={`mb-4 ${authStatusMessageClass}`}>{status}</div>
            )}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className={authFieldLabelClass}
                                >
                                    E-mailadres
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="name@example.com"
                                    className={authInputClass}
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className={authPrimaryButtonClass}
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && <Spinner />}
                                    Verstuur herstelmail
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className={authMutedPanelClass}>
                    <span>Terug naar</span>
                    <TextLink
                        href={login()}
                        className={`ml-1 ${authLinkClass}`}
                    >
                        inloggen
                    </TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Wachtwoord vergeten?',
    description: 'Vul je e-mailadres in. We sturen je een veilige herstellink.',
};
