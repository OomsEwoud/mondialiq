// Components
import { Form } from '@inertiajs/react';
import PageHead from '@/components/seo/page-head';
import TextLink from '@/components/typography/text-link';
import { Spinner } from '@/components/ui/feedback/spinner';
import { Button } from '@/components/ui/forms/button';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import {
    authLinkClass,
    authPrimaryButtonClass,
    authStatusMessageClass,
} from '@/utils/auth-form';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <PageHead
                title="E-mailadres bevestigen"
                description="Verify your MondialIQ email address to keep your account secure."
                noIndex
            />

            {status === 'verification-link-sent' && (
                <div className={`mb-4 text-center ${authStatusMessageClass}`}>
                    Er is een nieuwe verificatielink naar je e-mailadres
                    verzonden.
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button
                            disabled={processing}
                            className={authPrimaryButtonClass}
                        >
                            {processing && <Spinner />}
                            Verificatiemail opnieuw versturen
                        </Button>

                        <TextLink
                            href={logout()}
                            className={`mx-auto block text-sm ${authLinkClass}`}
                        >
                            Uitloggen
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Bevestig je e-mailadres',
    description: 'Klik op de link in onze e-mail om je account te activeren.',
};
