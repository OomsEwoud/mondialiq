import { Form, Link } from '@inertiajs/react';
import UpdateAccountController from '@/actions/App/Http/Controllers/Settings/UpdateAccountController';
import InputError from '@/components/forms/input-error';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import AvatarCropper from '@/components/user/avatar-cropper';
import ProfileAvatarField from '@/components/user/profile-avatar-field';
import { useAvatarUpload } from '@/hooks/use-avatar-upload';
import { send } from '@/routes/verification';
import type { AccountUser } from '@/types';
import { settingsFieldClassName } from '@/utils/settings-ui';
import { formatProviderName } from '@/utils/social-provider';

type Props = {
    user: AccountUser;
    isSsoOnly: boolean;
    needsEmailVerification: boolean;
    status?: string;
};

export default function UpdateProfileInformationForm({
    user,
    isSsoOnly,
    needsEmailVerification,
    status,
}: Props) {
    const avatarUpload = useAvatarUpload();

    return (
        <>
            <Form
                {...UpdateAccountController.form()}
                options={{ preserveScroll: true }}
                encType="multipart/form-data"
                className="space-y-7"
            >
                {({ processing, errors }) => (
                    <>
                        <section className="space-y-5 border-t border-border-subtle pt-6">
                            <h2 className="text-lg font-semibold">Profiel</h2>
                            <ProfileAvatarField
                                avatarInputRef={avatarUpload.croppedAvatarInput}
                                error={errors.avatar}
                                onAvatarChange={avatarUpload.handleAvatarChange}
                                previewUrl={avatarUpload.avatarPreview}
                                selectedFileName={
                                    avatarUpload.selectedAvatarName
                                }
                                user={user}
                            />
                            <div className="space-y-2">
                                <Label htmlFor="name">Naam</Label>
                                <Input
                                    id="name"
                                    className={settingsFieldClassName}
                                    defaultValue={user.name}
                                    name="name"
                                    autoComplete="name"
                                />
                                <InputError message={errors.name} />
                            </div>
                        </section>
                        <section className="space-y-4 border-t border-border-subtle pt-6">
                            <h2 className="text-lg font-semibold">Account</h2>
                            {isSsoOnly ? (
                                <dl className="space-y-4 text-sm">
                                    <div>
                                        <dt className="text-muted-foreground">
                                            E-mailadres
                                        </dt>
                                        <dd className="mt-1 break-all">
                                            {user.email}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">
                                            Inloggen
                                        </dt>
                                        <dd className="mt-1">
                                            Je logt in via{' '}
                                            {formatProviderName(
                                                user.social_provider,
                                            ) ?? 'je gekoppelde account'}
                                            . Beheer je inloggegevens bij deze
                                            aanbieder.
                                        </dd>
                                    </div>
                                </dl>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mailadres</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className={settingsFieldClassName}
                                        defaultValue={user.email}
                                        name="email"
                                        autoComplete="email"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            )}
                            {needsEmailVerification && (
                                <div className="space-y-2 text-sm">
                                    <p className="text-muted-foreground">
                                        Je e-mailadres is nog niet bevestigd.
                                    </p>
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="text-primary underline underline-offset-4"
                                    >
                                        Verificatiemail opnieuw versturen
                                    </Link>
                                    {status === 'verification-link-sent' && (
                                        <p
                                            role="status"
                                            className="text-primary"
                                        >
                                            Een nieuwe verificatielink is
                                            verstuurd.
                                        </p>
                                    )}
                                </div>
                            )}
                        </section>
                        <div className="flex justify-end">
                            <Button
                                disabled={processing}
                                data-test="update-profile-button"
                            >
                                Wijzigingen opslaan
                            </Button>
                        </div>
                    </>
                )}
            </Form>
            <AvatarCropper
                fileName={avatarUpload.selectedAvatarName}
                imageSrc={avatarUpload.cropperImage}
                open={avatarUpload.cropperOpen}
                onApply={avatarUpload.handleCroppedAvatar}
                onOpenChange={avatarUpload.setCropperOpen}
            />
        </>
    );
}
