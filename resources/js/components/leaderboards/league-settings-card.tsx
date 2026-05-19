import { Form } from '@inertiajs/react'
import { PencilLine, RefreshCcw, ShieldCheck } from 'lucide-react'
import UpdateLeagueController from '@/actions/App/Http/Controllers/Leagues/UpdateLeagueController'
import RefreshLeagueCodeController from '@/actions/App/Http/Controllers/Leagues/RefreshLeagueCodeController'
import InputError from '@/components/forms/input-error'
import { Button } from '@/components/ui/forms/button'
import { Input } from '@/components/ui/forms/input'
import { Label } from '@/components/ui/forms/label'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card'

type Props = {
    leagueId: number
    leagueName: string
}

const fieldClassName =
    'h-11 rounded-lg border-slate-300 bg-white text-slate-900 shadow-none placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-200'

export default function LeagueSettingsCard({ leagueId, leagueName }: Props) {
    return (
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="gap-2 px-4 py-5 sm:px-6">
                <div className="flex items-center gap-2 text-cyan-700">
                    <ShieldCheck className="size-4" />
                    <p className="text-xs font-black tracking-[0.16em] uppercase">
                        Owner controls
                    </p>
                </div>
                <CardTitle className="text-2xl font-black text-blue-950">
                    League settings
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-500">
                    Update your league name or refresh the invite code for future joins.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 pb-5 sm:px-6">
                <Form
                    {...UpdateLeagueController.form({ scoreboard: leagueId })}
                    options={{ preserveScroll: true }}
                    className="space-y-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="flex min-w-0 flex-col gap-2">
                                <Label
                                    htmlFor="league-name"
                                    className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                >
                                    League name
                                </Label>
                                <Input
                                    id="league-name"
                                    name="name"
                                    defaultValue={leagueName}
                                    className={fieldClassName}
                                    placeholder="Your friends league"
                                />
                                <div className="min-h-5">
                                    <InputError message={errors.name} />
                                </div>
                            </div>

                            <Button
                                disabled={processing}
                                className="h-11 rounded-lg px-5 font-black"
                            >
                                <PencilLine className="size-4" />
                                {processing ? 'Saving...' : 'Save league name'}
                            </Button>
                        </>
                    )}
                </Form>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                    <p className="text-sm font-black text-amber-900">
                        Refreshing the invite code invalidates the old code for new members.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-amber-800">
                        Existing members keep their access, but future joins must use the new code.
                    </p>

                    <Form
                        {...RefreshLeagueCodeController.form({ scoreboard: leagueId })}
                        options={{ preserveScroll: true }}
                        className="mt-4"
                    >
                        {({ processing }) => (
                            <Button
                                type="submit"
                                variant="outline"
                                disabled={processing}
                                className="h-11 rounded-lg border-amber-300 bg-white px-5 font-black text-amber-900 hover:bg-amber-100"
                            >
                                <RefreshCcw className="size-4" />
                                {processing ? 'Refreshing...' : 'Refresh invite code'}
                            </Button>
                        )}
                    </Form>
                </div>
            </CardContent>
        </Card>
    )
}
