import { Form } from '@inertiajs/react';
import PasswordInput from '@/components/auth/password/password-input';
import InputError from '@/components/forms/input-error';
import PageHead from '@/components/seo/page-head';
import TextLink from '@/components/typography/text-link';
import { Spinner } from '@/components/ui/feedback/spinner';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { login } from '@/routes';
import { store } from '@/routes/register';
import {
    authFieldLabelClass,
    authInputClass,
    authLinkClass,
    authMutedPanelClass,
    authPasswordInputClass,
    authPrimaryButtonClass,
} from '@/utils/auth-form';

export default function Register() {
    return (
        <>
            <PageHead
                title="Account maken"
                description="Maak gratis een account en doe mee met MondialiQ."
                noIndex
            />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className={authFieldLabelClass}
                                >
                                    Naam
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Je naam"
                                    className={authInputClass}
                                />
                                <InputError message={errors.name} />
                            </div>

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
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="jij@voorbeeld.be"
                                    className={authInputClass}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className={authFieldLabelClass}
                                >
                                    Wachtwoord
                                </Label>
                                <PasswordInput
                                    id="password"
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Minstens 8 tekens"
                                    className={authPasswordInputClass}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className={authFieldLabelClass}
                                >
                                    Bevestig wachtwoord
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Nog een keer"
                                    className={authPasswordInputClass}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className={`mt-2 ${authPrimaryButtonClass}`}
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Account maken
                            </Button>
                        </div>

                        <div className={authMutedPanelClass}>
                            Al eerder meegedaan?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className={authLinkClass}
                            >
                                Inloggen
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Doe mee met MondialiQ',
    description: 'Een gratis account. Daarna ben je meteen mee.',
};
