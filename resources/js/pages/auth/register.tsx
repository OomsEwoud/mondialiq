import { Form, Head } from '@inertiajs/react';
import PasswordInput from '@/components/auth/password/password-input';
import InputError from '@/components/forms/input-error';
import BackButton from '@/components/navigation/back-button';
import TextLink from '@/components/typography/text-link';
import { Spinner } from '@/components/ui/feedback/spinner';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { home, login } from '@/routes';
import { store } from '@/routes/register';
import {
    authFieldLabelClass,
    authInputClass,
    authLinkClass,
    authMutedPanelClass,
    authPrimaryButtonClass,
} from '@/utils/auth-form';

export default function Register() {
    return (
        <>
            <Head title="Register" />

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
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Example User"
                                    className={authInputClass}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className={authFieldLabelClass}
                                >
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    className={authInputClass}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className={authFieldLabelClass}
                                >
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Min. 8 characters"
                                    className={authInputClass}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className={authFieldLabelClass}
                                >
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Repeat password"
                                    className={authInputClass}
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
                                Create account
                            </Button>
                        </div>

                        <div className={authMutedPanelClass}>
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className={authLinkClass}
                            >
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            <div className="mt-6 flex justify-center border-t border-slate-100 pt-5">
                <BackButton fallbackHref={home.url()} />
            </div>
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description: 'Create your MondialIQ account to get started.',
};
