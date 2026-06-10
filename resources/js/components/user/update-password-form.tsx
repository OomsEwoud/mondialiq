import { Form } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { useRef } from 'react';

import UpdatePasswordController from '@/actions/App/Http/Controllers/Settings/UpdatePasswordController';
import PasswordInput from '@/components/auth/password/password-input';
import InputError from '@/components/forms/input-error';
import SettingsSection from '@/components/settings/settings-section';
import { Button } from '@/components/ui/forms/button';
import { Label } from '@/components/ui/forms/label';
import {
    settingsFieldClassName,
    settingsLabelClassName,
    settingsPrimaryButtonClassName,
} from '@/utils/settings-ui';

const fieldErrorWrapperClassName = 'min-h-10';
const fieldErrorClassName = 'leading-5';

export default function UpdatePasswordForm() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <SettingsSection
            icon={KeyRound}
            eyebrow="Password"
            title="Update password"
            description="Use at least 8 characters and avoid reused passwords."
        >
            <Form
                {...UpdatePasswordController.form()}
                options={{ preserveScroll: true }}
                resetOnError={[
                    'password',
                    'password_confirmation',
                    'current_password',
                ]}
                resetOnSuccess
                onError={(errors) => {
                    if (errors.password) {
                        passwordInput.current?.focus();
                    }

                    if (errors.current_password) {
                        currentPasswordInput.current?.focus();
                    }
                }}
                className="space-y-5"
            >
                {({ errors, processing }) => (
                    <>
                        <div className="grid items-start gap-5 lg:grid-cols-3">
                            <div className="flex min-w-0 flex-col gap-2">
                                <Label
                                    htmlFor="current_password"
                                    className={settingsLabelClassName}
                                >
                                    Current password
                                </Label>
                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className={settingsFieldClassName}
                                    autoComplete="current-password"
                                    placeholder="************"
                                />
                                <div className={fieldErrorWrapperClassName}>
                                    <InputError
                                        message={errors.current_password}
                                        className={fieldErrorClassName}
                                    />
                                </div>
                            </div>

                            <div className="flex min-w-0 flex-col gap-2">
                                <Label
                                    htmlFor="password"
                                    className={settingsLabelClassName}
                                >
                                    New password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    className={settingsFieldClassName}
                                    autoComplete="new-password"
                                    placeholder="Min. 8 characters"
                                />
                                <div className={fieldErrorWrapperClassName}>
                                    <InputError
                                        message={errors.password}
                                        className={fieldErrorClassName}
                                    />
                                </div>
                            </div>

                            <div className="flex min-w-0 flex-col gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className={settingsLabelClassName}
                                >
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    className={settingsFieldClassName}
                                    autoComplete="new-password"
                                    placeholder="Repeat new password"
                                />
                                <div className={fieldErrorWrapperClassName}>
                                    <InputError
                                        message={errors.password_confirmation}
                                        className={fieldErrorClassName}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                disabled={processing}
                                data-test="update-password-button"
                                className={settingsPrimaryButtonClassName}
                            >
                                Save password
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </SettingsSection>
    );
}
