import { Form } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useRef } from 'react';
import DeleteAccountController from '@/actions/App/Http/Controllers/Settings/DeleteAccountController';
import PasswordInput from '@/components/auth/password/password-input';
import InputError from '@/components/forms/input-error';
import { Button } from '@/components/ui/forms/button';
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
import type { User } from '@/types';
import {
    settingsDangerSectionClassName,
    settingsFieldClassName,
    settingsLabelClassName,
} from '@/utils/settings-ui';
import { formatProviderName } from '@/utils/social-provider';

type Props = {
    user?: User;
};

export default function DeleteUser({ user }: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const requiresPassword = user?.has_password ?? true;
    const providerName = formatProviderName(user?.social_provider);
    const providerAccountLabel = providerName
        ? `${providerName} account.`
        : 'login account.';

    return (
        <section className={settingsDangerSectionClassName}>
            <div className="mb-5 flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
                    <AlertTriangle className="size-5" />
                </span>
                <div>
                    <p className="mb-1 text-xs font-black tracking-widest text-red-500 uppercase">
                        Danger zone
                    </p>
                    <h2 className="text-xl font-black tracking-tight text-blue-950">
                        Delete account
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                        Permanently delete your account and all related data.
                        This cannot be undone.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-red-700">
                    Only continue if you are completely sure.
                </p>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                            className="rounded-lg font-black"
                        >
                            Delete account
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            Are you sure you want to delete your account?
                        </DialogTitle>
                        <DialogDescription>
                            Once your account is deleted, all of its resources
                            and data will also be permanently deleted.
                            {requiresPassword
                                ? ' Please enter your password to confirm you would like to permanently delete your account.'
                                : ' Only continue if you are completely sure.'}
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
                                    {requiresPassword ? (
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="password"
                                                className={`sr-only ${settingsLabelClassName}`}
                                            >
                                                Password
                                            </Label>

                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                ref={passwordInput}
                                                className={settingsFieldClassName}
                                                placeholder="Password"
                                                autoComplete="current-password"
                                            />

                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                                            This only deletes your MondialIQ
                                            account. It will not delete your
                                            {` ${providerAccountLabel}`}
                                        </div>
                                    )}

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                variant="secondary"
                                                onClick={() =>
                                                    resetAndClearErrors()
                                                }
                                                className="rounded-lg font-black"
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            variant="destructive"
                                            disabled={processing}
                                            asChild
                                            className="rounded-lg font-black"
                                        >
                                            <button
                                                type="submit"
                                                data-test="confirm-delete-user-button"
                                            >
                                                Delete account
                                            </button>
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
