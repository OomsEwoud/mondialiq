import { Form } from '@inertiajs/react';
import { useRef, useState } from 'react';
import DeleteAccountController from '@/actions/App/Http/Controllers/Settings/DeleteAccountController';
import PasswordInput from '@/components/auth/password/password-input';
import InputError from '@/components/forms/input-error';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/overlays/dialog';
import type { AccountUser } from '@/types';
import {
    settingsDangerSectionClassName,
    settingsFieldClassName,
    settingsLabelClassName,
} from '@/utils/settings-ui';
import { formatProviderName } from '@/utils/social-provider';

type Props = {
    user?: AccountUser;
};

export default function DeleteUser({ user }: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const [confirmationText, setConfirmationText] = useState('');
    const requiresPassword = user?.has_password ?? true;
    const providerName = formatProviderName(user?.social_provider);
    const providerAccountLabel = providerName
        ? `${providerName} account.`
        : 'login account.';

    return (
        <section className={settingsDangerSectionClassName}>
            <div className="mb-4">
                <h2 className="text-lg font-semibold">Account verwijderen</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Verwijder je MondialIQ-account, voorspellingen en
                    bijbehorende gegevens permanent. Dit kun je niet ongedaan
                    maken.
                </p>
            </div>
            <div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                            className="w-full border border-destructive/30 bg-transparent text-destructive shadow-none hover:bg-destructive/10 sm:w-auto"
                            onClick={() => setConfirmationText('')}
                        >
                            Account verwijderen
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-xl border-border-subtle">
                        <DialogTitle>
                            Weet je zeker dat je je account wilt verwijderen?
                        </DialogTitle>
                        <DialogDescription>
                            Dit verwijdert je account, voorspellingen en
                            bijbehorende gegevens permanent.
                            {requiresPassword
                                ? ' Vul je wachtwoord in en typ DELETE om te bevestigen.'
                                : ' Typ DELETE om te bevestigen.'}
                        </DialogDescription>

                        <Form
                            {...DeleteAccountController.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-6"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="grid gap-4">
                                        {requiresPassword ? (
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="password"
                                                    className={`sr-only ${settingsLabelClassName}`}
                                                >
                                                    Wachtwoord
                                                </Label>

                                                <PasswordInput
                                                    id="password"
                                                    name="password"
                                                    ref={passwordInput}
                                                    className={
                                                        settingsFieldClassName
                                                    }
                                                    placeholder="Wachtwoord"
                                                    autoComplete="current-password"
                                                />

                                                <InputError
                                                    message={errors.password}
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-sm leading-6 text-muted-foreground">
                                                Dit verwijdert alleen je
                                                MondialIQ- account, niet je
                                                gekoppelde
                                                {` ${providerAccountLabel}`}
                                            </div>
                                        )}

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="delete-confirmation"
                                                className={
                                                    settingsLabelClassName
                                                }
                                            >
                                                Typ DELETE om te bevestigen
                                            </Label>
                                            <Input
                                                id="delete-confirmation"
                                                value={confirmationText}
                                                onChange={(event) =>
                                                    setConfirmationText(
                                                        event.target.value,
                                                    )
                                                }
                                                className={
                                                    settingsFieldClassName
                                                }
                                                placeholder="DELETE"
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                                        <DialogClose asChild>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    resetAndClearErrors();
                                                    setConfirmationText('');
                                                }}
                                                className="w-full rounded-lg font-semibold sm:w-auto"
                                            >
                                                Annuleren
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            type="submit"
                                            disabled={
                                                processing ||
                                                confirmationText !== 'DELETE'
                                            }
                                            className="w-full rounded-lg bg-red-600 font-semibold text-foreground shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                            data-test="confirm-delete-user-button"
                                        >
                                            Account verwijderen
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </section>
    );
}
