import { Form } from '@inertiajs/react';
import PasswordInput from '@/components/auth/password/password-input';
import InputError from '@/components/forms/input-error';
import PageHead from '@/components/seo/page-head';
import { Spinner } from '@/components/ui/feedback/spinner';
import { Button } from '@/components/ui/forms/button';
import { Label } from '@/components/ui/forms/label';
import { store } from '@/routes/password/confirm';
import {
    authFieldLabelClass,
    authPasswordInputClass,
    authPrimaryButtonClass,
} from '@/utils/auth-form';

export default function ConfirmPassword() {
    return (
        <>
            <PageHead
                title="Wachtwoord bevestigen"
                description="Confirm your MondialIQ password before continuing to a protected account area."
                noIndex
            />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label
                                htmlFor="password"
                                className={authFieldLabelClass}
                            >
                                Wachtwoord
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="Your account password"
                                autoComplete="current-password"
                                autoFocus
                                className={authPasswordInputClass}
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center">
                            <Button
                                className={authPrimaryButtonClass}
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner />}
                                Bevestigen
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Bevestig je wachtwoord',
    description: 'Bevestig je wachtwoord om veilig verder te gaan.',
};
