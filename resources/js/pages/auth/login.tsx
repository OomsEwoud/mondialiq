import { Form, Head } from '@inertiajs/react';
import PasswordInput from '@/components/auth/password/password-input';
import InputError from '@/components/forms/input-error';
import BackButton from '@/components/navigation/back-button';
import TextLink from '@/components/typography/text-link';
import { Spinner } from '@/components/ui/feedback/spinner';
import { Button } from '@/components/ui/forms/button';
import { Checkbox } from '@/components/ui/forms/checkbox';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { home, register } from '@/routes';
import { redirect as authRedirect } from '@/routes/auth';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import {
    authFieldLabelClass,
    authInputClass,
    authLinkClass,
    authMutedPanelClass,
    authPasswordInputClass,
    authPrimaryButtonClass,
    authStatusMessageClass,
} from '@/utils/auth-form';

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

const socialDividerLabelClass =
    'text-xs font-black tracking-widest text-slate-400 uppercase';
const rememberMeContainerClass =
    'flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3';
const socialButtonBaseClass = 'h-12 rounded-lg font-black shadow-none';

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const showStatus = Boolean(status);

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
                        {showStatus && (
                            <div className={authStatusMessageClass}>
                                {status}
                            </div>
                        )}

                        <InputError message={errors.socialite} />

                        <div className="grid gap-5">
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
                                    name="email"
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    className={authInputClass}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password"
                                        className={authFieldLabelClass}
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className={`ml-auto text-sm font-semibold ${authLinkClass}`}
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
                                    className={authPasswordInputClass}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className={rememberMeContainerClass}>
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
                                className={`mt-2 ${authPrimaryButtonClass}`}
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
                                <span className={socialDividerLabelClass}>
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
                                        className={`${socialButtonBaseClass} ${provider.className}`}
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
                            <div className={authMutedPanelClass}>
                                Don't have an account?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={5}
                                    className={authLinkClass}
                                >
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            <div className="mt-6 flex justify-center border-t border-slate-100 pt-5">
                <BackButton fallbackHref={home.url()} />
            </div>
        </>
    );
}

Login.layout = {
    title: 'Log in to MondialIQ',
    description: 'Welcome back. Sign in to continue.',
};
