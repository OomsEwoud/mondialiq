import { Form } from '@inertiajs/react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useMemo, useState } from 'react';

import UpdatePredictionPreferencesController from '@/actions/App/Http/Controllers/Settings/UpdatePredictionPreferencesController';
import InputError from '@/components/forms/input-error';
import { Button } from '@/components/ui/forms/button';
import { cn } from '@/lib/utils';
import type { PredictionPreferences } from '@/types';
import {
    settingsPrimaryButtonClassName,
    settingsSubtlePanelClassName,
} from '@/utils/settings-ui';

interface Props {
    preferences: PredictionPreferences;
}

function SegmentedControl({
    value,
    options,
    onChange,
    disabled,
}: {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    disabled?: boolean;
}) {
    return (
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {options.map((option) => {
                const isActive = value === option.value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                            isActive
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700',
                            disabled && 'cursor-not-allowed opacity-50',
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

function ToggleSwitch({
    checked,
    onChange,
    label,
    disabled,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    disabled?: boolean;
}) {
    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors',
                    checked ? 'bg-cyan-500' : 'bg-slate-300',
                    disabled && 'cursor-not-allowed opacity-50',
                )}
            >
                <span
                    className={cn(
                        'inline-block size-5 rounded-full bg-white shadow-sm transition-transform',
                        checked ? 'translate-x-6' : 'translate-x-1',
                    )}
                />
            </button>
            <span className="text-sm font-semibold text-slate-900">
                {label}
            </span>
        </div>
    );
}

export default function PredictionPreferencesSection({ preferences }: Props) {
    const [data, setData] = useState<PredictionPreferences>({
        predictions_visibility: preferences.predictions_visibility,
        default_prediction_visibility:
            preferences.default_prediction_visibility,
        show_on_leaderboards: preferences.show_on_leaderboards,
        allow_group_visibility: preferences.allow_group_visibility,
    });

    const hasChanges = useMemo(() => {
        return (
            data.predictions_visibility !==
                preferences.predictions_visibility ||
            data.default_prediction_visibility !==
                preferences.default_prediction_visibility ||
            data.show_on_leaderboards !== preferences.show_on_leaderboards ||
            data.allow_group_visibility !== preferences.allow_group_visibility
        );
    }, [data, preferences]);

    return (
        <Form
            {...UpdatePredictionPreferencesController.form()}
            options={{ preserveScroll: true }}
            className="space-y-5"
        >
            {({ processing, errors }) => (
                <>
                    <div className={settingsSubtlePanelClassName}>
                        <div className="flex items-center gap-2 text-slate-600">
                            {data.predictions_visibility === 'public' ? (
                                <Eye className="size-4" />
                            ) : (
                                <EyeOff className="size-4" />
                            )}
                            <p className="text-xs font-semibold tracking-wide uppercase">
                                Prediction visibility
                            </p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Public predictions can appear on match pages, groups
                            and shared prediction views. Private predictions are
                            only visible to you.
                        </p>
                        <div className="mt-4">
                            <SegmentedControl
                                value={data.predictions_visibility}
                                options={[
                                    {
                                        value: 'public',
                                        label: 'Public predictions',
                                    },
                                    {
                                        value: 'private',
                                        label: 'Private predictions',
                                    },
                                ]}
                                disabled={processing}
                                onChange={(value) =>
                                    setData((prev) => ({
                                        ...prev,
                                        predictions_visibility: value as
                                            | 'public'
                                            | 'private',
                                    }))
                                }
                            />
                            <input
                                type="hidden"
                                name="predictions_visibility"
                                value={data.predictions_visibility}
                            />
                            <div className="min-h-10">
                                <InputError
                                    message={errors.predictions_visibility}
                                    className="leading-5"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={settingsSubtlePanelClassName}>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Shield className="size-4" />
                            <p className="text-xs font-semibold tracking-wide uppercase">
                                Default visibility for new predictions
                            </p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            This is applied automatically when you create a new
                            prediction.
                        </p>
                        <div className="mt-4">
                            <SegmentedControl
                                value={data.default_prediction_visibility}
                                options={[
                                    { value: 'public', label: 'Public' },
                                    { value: 'private', label: 'Private' },
                                ]}
                                disabled={processing}
                                onChange={(value) =>
                                    setData((prev) => ({
                                        ...prev,
                                        default_prediction_visibility: value as
                                            | 'public'
                                            | 'private',
                                    }))
                                }
                            />
                            <input
                                type="hidden"
                                name="default_prediction_visibility"
                                value={data.default_prediction_visibility}
                            />
                            <div className="min-h-10">
                                <InputError
                                    message={
                                        errors.default_prediction_visibility
                                    }
                                    className="leading-5"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid items-start gap-5 sm:grid-cols-2">
                        <div className={settingsSubtlePanelClassName}>
                            <div className="mb-3">
                                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    Leaderboards
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                    Disable this if you do not want your profile
                                    to appear in public ranking views.
                                </p>
                            </div>
                            <ToggleSwitch
                                checked={data.show_on_leaderboards}
                                disabled={processing}
                                label="Show me on leaderboards"
                                onChange={(checked) =>
                                    setData((prev) => ({
                                        ...prev,
                                        show_on_leaderboards: checked,
                                    }))
                                }
                            />
                            <input
                                type="hidden"
                                name="show_on_leaderboards"
                                value={data.show_on_leaderboards ? '1' : '0'}
                            />
                            <div className="min-h-10">
                                <InputError
                                    message={errors.show_on_leaderboards}
                                    className="leading-5"
                                />
                            </div>
                        </div>

                        <div className={settingsSubtlePanelClassName}>
                            <div className="mb-3">
                                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    Group visibility
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                    Useful for private prediction groups with
                                    friends.
                                </p>
                            </div>
                            <ToggleSwitch
                                checked={data.allow_group_visibility}
                                disabled={processing}
                                label="Allow group members to see my predictions"
                                onChange={(checked) =>
                                    setData((prev) => ({
                                        ...prev,
                                        allow_group_visibility: checked,
                                    }))
                                }
                            />
                            <input
                                type="hidden"
                                name="allow_group_visibility"
                                value={data.allow_group_visibility ? '1' : '0'}
                            />
                            <div className="min-h-10">
                                <InputError
                                    message={errors.allow_group_visibility}
                                    className="leading-5"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            disabled={processing || !hasChanges}
                            data-test="save-prediction-preferences-button"
                            className={settingsPrimaryButtonClassName}
                        >
                            Save preferences
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
