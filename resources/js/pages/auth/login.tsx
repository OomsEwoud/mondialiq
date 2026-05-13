import { Form, Head } from '@inertiajs/react';
import PasswordInput from '@/components/auth/password/password-input';
import InputError from '@/components/forms/input-error';
import TextLink from '@/components/typography/text-link';
import { Spinner } from '@/components/ui/feedback/spinner';
import { Button } from '@/components/ui/forms/button';
import { Checkbox } from '@/components/ui/forms/checkbox';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { register } from '@/routes';
import { redirect as authRedirect } from '@/routes/auth';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

const socialProviders = [
    {
        name: 'Google',
        provider: 'google',
        mark: 'G',
        className:
            'border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:text-blue-950',
    },
    {
        name: 'Facebook',
        provider: 'facebook',
        mark: 'f',
        className:
            'border-blue-200 bg-blue-50 text-blue-950 hover:border-blue-300 hover:bg-blue-100',
    },
];

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        {status && (
                            <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-blue-950">
                                {status}
                            </div>
                        )}

                        <div className="grid gap-5">
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
                                    name="email"
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    className="auth-input h-11 rounded-lg shadow-none focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password"
                                        className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm font-semibold text-blue-950 decoration-cyan-300 hover:text-cyan-600"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="********"
                                    className="auth-input h-12 rounded-lg shadow-none focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-slate-300 data-[state=checked]:border-cyan-500 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-blue-950"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-semibold text-slate-600"
                                >
                                    Remember me
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full rounded-lg bg-blue-950 font-black text-white shadow-lg shadow-blue-950/15 hover:bg-cyan-500 hover:text-blue-950"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-slate-200" />
                                <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
                                    Or continue with
                                </span>
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {socialProviders.map((provider) => (
                                    <Button
                                        key={provider.provider}
                                        asChild
                                        variant="outline"
                                        className={`h-12 rounded-lg font-black shadow-none ${provider.className}`}
                                    >
                                        <a
                                            href={authRedirect.url(
                                                provider.provider,
                                            )}
                                            aria-label={`Log in with ${provider.name}`}
                                        >
                                            <span className="flex size-6 items-center justify-center rounded-full bg-white text-sm font-black shadow-sm ring-1 ring-slate-200">
                                                {provider.mark}
                                            </span>
                                            {provider.name}
                                        </a>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {canRegister && (
                            <div className="rounded-lg bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                                Don't have an account?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={5}
                                    className="font-black text-blue-950 decoration-cyan-300 hover:text-cyan-600"
                                >
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Log in to MondialIQ',
    description: 'Welcome back. Sign in to continue.',
};
