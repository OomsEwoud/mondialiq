import { useForm } from '@inertiajs/react';
import UpdatePredictionPreferencesController from '@/actions/App/Http/Controllers/Settings/UpdatePredictionPreferencesController';
import InputError from '@/components/forms/input-error';
import { Button } from '@/components/ui/forms/button';
import type { PredictionPreferences } from '@/types';
import { settingsFieldClassName } from '@/utils/settings-ui';

export default function PredictionPreferencesSection({
    preferences,
}: {
    preferences: PredictionPreferences;
}) {
    const { data, setData, patch, processing, errors, isDirty, setDefaults } =
        useForm<PredictionPreferences>(preferences);

    return (
        <form
            className="space-y-7"
            onSubmit={(event) => {
                event.preventDefault();
                patch(UpdatePredictionPreferencesController.url(), {
                    preserveScroll: true,
                    onSuccess: () => setDefaults(data),
                });
            }}
        >
            <section className="space-y-5">
                <h2 className="text-lg font-semibold">Voorspellingen</h2>
                <div className="space-y-2">
                    <label
                        htmlFor="predictions_visibility"
                        className="block text-sm font-medium"
                    >
                        Wie kan mijn voorspellingen zien?
                    </label>
                    <p
                        id="visibility-help"
                        className="text-sm leading-6 text-muted-foreground"
                    >
                        Openbare voorspellingen kunnen op wedstrijdpagina’s, in
                        groepen en gedeelde overzichten verschijnen.
                        Privévoorspellingen zijn alleen voor jou zichtbaar.
                    </p>
                    <select
                        id="predictions_visibility"
                        className={settingsFieldClassName + ' w-full px-3'}
                        aria-describedby="visibility-help"
                        disabled={processing}
                        value={data.predictions_visibility}
                        onChange={(event) =>
                            setData(
                                'predictions_visibility',
                                event.target.value as 'public' | 'private',
                            )
                        }
                    >
                        <option value="public">Openbaar</option>
                        <option value="private">Privé</option>
                    </select>
                    <InputError message={errors.predictions_visibility} />
                </div>
                <div className="space-y-2">
                    <label
                        htmlFor="default_prediction_visibility"
                        className="block text-sm font-medium"
                    >
                        Standaard voor nieuwe voorspellingen
                    </label>
                    <select
                        id="default_prediction_visibility"
                        className={settingsFieldClassName + ' w-full px-3'}
                        disabled={processing}
                        value={data.default_prediction_visibility}
                        onChange={(event) =>
                            setData(
                                'default_prediction_visibility',
                                event.target.value as 'public' | 'private',
                            )
                        }
                    >
                        <option value="public">Openbaar</option>
                        <option value="private">Privé</option>
                    </select>
                    <InputError
                        message={errors.default_prediction_visibility}
                    />
                </div>
            </section>
            <section className="space-y-5 border-t border-border-subtle pt-6">
                <h2 className="text-lg font-semibold">
                    Klassementen en groepen
                </h2>
                <div>
                    <label className="flex cursor-pointer items-start gap-3 text-sm">
                        <input
                            type="checkbox"
                            className="mt-0.5 size-4 shrink-0 accent-primary"
                            checked={data.show_on_leaderboards}
                            disabled={processing}
                            onChange={(event) =>
                                setData(
                                    'show_on_leaderboards',
                                    event.target.checked,
                                )
                            }
                        />
                        Toon mij in klassementen
                    </label>
                    <InputError message={errors.show_on_leaderboards} />
                </div>
                <div>
                    <label className="flex cursor-pointer items-start gap-3 text-sm">
                        <input
                            type="checkbox"
                            className="mt-0.5 size-4 shrink-0 accent-primary"
                            checked={data.allow_group_visibility}
                            disabled={processing}
                            onChange={(event) =>
                                setData(
                                    'allow_group_visibility',
                                    event.target.checked,
                                )
                            }
                        />
                        Sta toe dat groepsleden mijn voorspellingen zien
                    </label>
                    <InputError message={errors.allow_group_visibility} />
                </div>
            </section>
            <div className="flex justify-end">
                <Button
                    disabled={processing || !isDirty}
                    data-test="save-prediction-preferences-button"
                >
                    Voorkeuren opslaan
                </Button>
            </div>
        </form>
    );
}
