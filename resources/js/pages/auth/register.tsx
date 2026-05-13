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
                                    className="text-xs font-black tracking-widest text-slate-500 uppercase"
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
                                    className="auth-input h-11 rounded-lg shadow-none focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-black tracking-widest text-slate-500 uppercase"
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
                                    className="auth-input h-11 rounded-lg shadow-none focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                >
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Min. 8 characters"
                                    className="auth-input h-11 rounded-lg shadow-none focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                >
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Repeat password"
                                    className="auth-input h-11 rounded-lg shadow-none focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full rounded-lg bg-blue-950 font-black text-white shadow-lg shadow-blue-950/15 hover:bg-cyan-500 hover:text-blue-950"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="rounded-lg bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="font-black text-blue-950 decoration-cyan-300 hover:text-cyan-600"
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
