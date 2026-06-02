import { Form } from '@inertiajs/react';
import type * as React from 'react';
import PasswordInput from '@/components/auth/password/password-input';
import InputError from '@/components/forms/input-error';
import BackButton from '@/components/navigation/back-button';
import PageHead from '@/components/seo/page-head';
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

type SocialProvider = {
    name: string;
    provider: string;
    icon: React.ReactNode;
    className: string;
    iconClassName: string;
};

const socialProviders = [
    {
        name: 'Google',
        provider: 'google',
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
                <path
                    fill="#4285F4"
                    d="M21.6 12.23c0-.68-.06-1.33-.17-1.96H12v3.7h5.39a4.61 4.61 0 0 1-2 3.03v2.52h3.24c1.89-1.74 2.97-4.3 2.97-7.29Z"
                />
                <path
                    fill="#34A853"
                    d="M12 22c2.7 0 4.97-.9 6.62-2.45l-3.24-2.52c-.9.6-2.05.95-3.38.95-2.6 0-4.8-1.76-5.58-4.12H3.08v2.6A10 10 0 0 0 12 22Z"
                />
                <path
                    fill="#FBBC05"
                    d="M6.42 13.86A5.98 5.98 0 0 1 6.1 12c0-.65.11-1.28.32-1.86V7.54H3.08A10 10 0 0 0 2 12c0 1.61.39 3.14 1.08 4.46l3.34-2.6Z"
                />
                <path
                    fill="#EA4335"
                    d="M12 6.02c1.47 0 2.8.5 3.84 1.5l2.88-2.88C16.96 2.98 14.7 2 12 2a10 10 0 0 0-8.92 5.54l3.34 2.6C7.2 7.78 9.4 6.02 12 6.02Z"
                />
            </svg>
        ),
        className:
            'border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:text-blue-950',
        iconClassName: 'bg-white ring-slate-200',
    },
    {
        name: 'Facebook',
        provider: 'facebook',
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
                <path
                    fill="#1877F2"
                    d="M24 12a12 12 0 1 0-13.88 11.85v-8.39H7.08V12h3.04V9.36c0-3 1.79-4.66 4.53-4.66 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.31l-.53 3.46h-2.78v8.39A12 12 0 0 0 24 12Z"
                />
                <path
                    fill="#fff"
                    d="m16.65 15.46.53-3.46h-3.31V9.75c0-.95.46-1.87 1.95-1.87h1.51V4.93s-1.37-.23-2.68-.23c-2.74 0-4.53 1.66-4.53 4.66V12H7.08v3.46h3.04v8.39a12.1 12.1 0 0 0 3.75 0v-8.39h2.78Z"
                />
            </svg>
        ),
        className:
            'border-blue-200 bg-blue-50 text-blue-950 hover:border-blue-300 hover:bg-blue-100',
        iconClassName: 'bg-white ring-blue-100',
    },
] satisfies SocialProvider[];

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
            <PageHead
                title="Log in"
                description="Log in to MondialIQ to manage your World Cup predictions, account settings and friends league rankings."
                noIndex
            />

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
                                            <span
                                                className={`flex size-7 items-center justify-center rounded-full shadow-sm ring-1 ${provider.iconClassName}`}
                                            >
                                                {provider.icon}
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
