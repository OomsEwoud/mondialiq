import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/forms/input-error';
import TextLink from '@/components/typography/text-link';
import { Spinner } from '@/components/ui/feedback/spinner';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot password" />

            {status && (
                <div className="mb-4 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-blue-950">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
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
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="you@example.com"
                                    className="auth-input h-11 rounded-lg shadow-none focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="h-12 w-full rounded-lg bg-blue-950 font-black text-white shadow-lg shadow-blue-950/15 hover:bg-cyan-500 hover:text-blue-950"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && <Spinner />}
                                    Email password reset link
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="rounded-lg bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
                    <span>Or, return to</span>
                    <TextLink
                        href={login()}
                        className="ml-1 font-black text-blue-950 decoration-cyan-300 hover:text-cyan-600"
                    >
                        log in
                    </TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Forgot password',
    description: 'Enter your email and we will send a reset link.',
};
