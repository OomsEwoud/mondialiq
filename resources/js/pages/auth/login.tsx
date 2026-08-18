import { Form } from '@inertiajs/react';
import type * as React from 'react';
import PasswordInput from '@/components/auth/password/password-input';
import InputError from '@/components/forms/input-error';
import PageHead from '@/components/seo/page-head';
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
    intended?: string;
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
            'border-[#343b37] bg-[#171c19] text-[#daddd9] hover:border-[#4a534e] hover:bg-[#1d231f] hover:text-white',
        iconClassName: 'bg-white ring-[#343b37]',
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
            'border-[#343b37] bg-[#171c19] text-[#daddd9] hover:border-[#4a534e] hover:bg-[#1d231f] hover:text-white',
        iconClassName: 'bg-white ring-[#343b37]',
    },
] satisfies SocialProvider[];

const socialDividerLabelClass =
    'text-[0.65rem] font-semibold tracking-[0.14em] text-[#68706b] uppercase';
const rememberMeContainerClass =
    'flex items-center gap-3 rounded-xl border border-[#262c29] bg-[#141916] px-3 py-3';
const socialButtonBaseClass = 'h-12 rounded-xl font-semibold shadow-none';

export default function Login({
    status,
    canResetPassword,
    canRegister,
    intended,
}: Props) {
    const showStatus = Boolean(status);

    return (
        <>
            <PageHead
                title="Inloggen"
                description="Log veilig in op je MondialiQ-account."
                noIndex
            />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        {intended && (
                            <input
                                type="hidden"
                                name="intended"
                                value={intended}
                            />
                        )}

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
                                    E-mailadres
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
                                        Wachtwoord
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className={`ml-auto text-sm font-semibold ${authLinkClass}`}
                                            tabIndex={5}
                                        >
                                            Wachtwoord vergeten?
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
                                    className="border-[#46504a] bg-[#171c19] data-[state=checked]:border-[#57ad78] data-[state=checked]:bg-[#57ad78] data-[state=checked]:text-[#0b0e0d]"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-semibold text-[#949d97]"
                                >
                                    Onthoud mij
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
                                Inloggen
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-[#262c29]" />
                                <span className={socialDividerLabelClass}>
                                    Of ga verder met
                                </span>
                                <div className="h-px flex-1 bg-[#262c29]" />
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
                                                intended
                                                    ? { query: { intended } }
                                                    : undefined,
                                            )}
                                            aria-label={`Inloggen met ${provider.name}`}
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
                                Nog geen account?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={5}
                                    className={authLinkClass}
                                >
                                    Account maken
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
    title: 'Welkom terug',
    description:
        'Log in om je voetbalinzichten en gevolgde competities te bekijken.',
};
