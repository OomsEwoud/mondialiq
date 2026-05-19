import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, LogIn, Ticket } from 'lucide-react';
import InputError from '@/components/forms/input-error';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import { leaderboards } from '@/routes';
import type { LeagueJoinPageProps } from '@/types';

const fieldClassName =
    'h-11 rounded-lg border-slate-300 bg-white text-slate-900 shadow-none placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-200';

export default function LeagueJoin({
    initialCode,
    currentLeagueCount,
    maxLeagueCount,
    hasReachedLeagueLimit,
}: LeagueJoinPageProps) {
    return (
        <>
            <Head title="Join League" />

            <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                    <Link
                        href={leaderboards.url()}
                        className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition-colors hover:text-blue-950"
                    >
                        <ArrowLeft className="size-4" />
                        Back to leaderboards
                    </Link>

                    <div className="mt-6 max-w-2xl">
                        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                            <Ticket className="size-6" />
                        </div>
                        <p className="text-xs font-black tracking-[0.22em] text-cyan-600 uppercase">
                            Friends Leagues
                        </p>
                        <h1 className="mt-2 text-3xl font-black text-blue-950 sm:text-4xl">
                            Join with an invite code
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                            Enter the private league code you received from a
                            friend to join their standings instantly.
                        </p>
                        <p className="mt-4 text-sm font-semibold text-slate-600">
                            {currentLeagueCount}/{maxLeagueCount} leagues joined
                        </p>
                    </div>
                </section>

                <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                    <CardHeader className="gap-2 px-4 py-5 sm:px-6">
                        <CardTitle className="text-2xl font-black text-blue-950">
                            Invite code
                        </CardTitle>
                        <CardDescription className="text-sm leading-6 text-slate-500">
                            Codes use 8 uppercase letters or numbers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 pb-5 sm:px-6">
                        <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <p className="text-sm font-black text-blue-950">
                                You can join up to {maxLeagueCount} leagues.
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                {hasReachedLeagueLimit
                                    ? 'You are already at the league limit. Leave one of your current leagues before joining another.'
                                    : `You currently belong to ${currentLeagueCount} league${currentLeagueCount === 1 ? '' : 's'}.`}
                            </p>
                        </div>

                        <Form
                            action="/leagues/join"
                            method="post"
                            options={{ preserveScroll: true }}
                            className="space-y-5"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="flex min-w-0 flex-col gap-2">
                                        <Label
                                            htmlFor="code"
                                            className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                        >
                                            League code
                                        </Label>
                                        <Input
                                            id="code"
                                            name="code"
                                            className={fieldClassName}
                                            placeholder="ABCDEFGH"
                                            defaultValue={initialCode}
                                            maxLength={8}
                                            autoCapitalize="characters"
                                            autoCorrect="off"
                                        />
                                        <div className="min-h-10">
                                            <InputError
                                                message={errors.code}
                                                className="leading-5"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                        <Button
                                            asChild
                                            type="button"
                                            variant="ghost"
                                            className="h-11 rounded-lg px-5 font-black text-slate-600"
                                        >
                                            <Link href={leaderboards.url()}>
                                                Cancel
                                            </Link>
                                        </Button>
                                        <Button
                                            disabled={processing || hasReachedLeagueLimit}
                                            className="h-11 rounded-lg px-5 font-black"
                                        >
                                            <LogIn className="size-4" />
                                            Join League
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
