import { Form, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, LifeBuoy, Lock, Send } from 'lucide-react';
import StoreFeedbackController from '@/actions/App/Http/Controllers/Feedback/StoreFeedbackController';
import InputError from '@/components/forms/input-error';
import PageHead from '@/components/seo/page-head';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Textarea } from '@/components/ui/forms/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import { login, register } from '@/routes';

type ContactPageProps = {
    categories: string[];
};

const fieldClassName =
    'h-11 rounded-lg border-slate-300 bg-white text-slate-900 shadow-none placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-200';
const labelClassName =
    'text-xs font-black tracking-widest text-slate-500 uppercase';

export default function Contact({ categories }: ContactPageProps) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <>
            <PageHead
                title="Contact & feedback"
                description="Report incorrect data, glitches, account issues or suggestions so MondialIQ can keep improving."
            />

            <div className="space-y-6">
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.2),transparent_24rem),linear-gradient(135deg,#ffffff_0%,#f8fbff_48%,#eef7ff_100%)] p-6 shadow-2xl shadow-sm sm:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm ring-slate-200">
                                <LifeBuoy className="size-5" />
                            </div>
                            <p className="text-xs font-black tracking-wide text-cyan-600 uppercase">
                                Support
                            </p>
                            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                                Contact & feedback
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                Found incorrect data, a glitch or do you have a
                                suggestion? Let us know so we can improve
                                MondialiQ.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
                            Reports are linked to your MondialIQ account.
                        </div>
                    </div>
                </section>

                {user ? (
                    <Card className="rounded-2xl border-slate-200 bg-white shadow-xl shadow-sm">
                        <CardHeader className="gap-2 px-5 py-5 sm:px-6">
                            <CardTitle className="text-2xl font-black text-slate-900">
                                Send a report
                            </CardTitle>
                            <CardDescription className="max-w-2xl text-sm leading-6 text-slate-500">
                                Add enough detail so an admin can understand
                                what happened and where to look.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-5 pb-6 sm:px-6">
                            <Form
                                {...StoreFeedbackController.form()}
                                options={{ preserveScroll: true }}
                                resetOnSuccess
                                className="space-y-5"
                            >
                                {({
                                    errors,
                                    processing,
                                    recentlySuccessful,
                                }) => (
                                    <>
                                        {recentlySuccessful && (
                                            <div
                                                className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
                                                role="status"
                                            >
                                                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                                                <span>
                                                    Thanks, your feedback has
                                                    been sent. An admin can now
                                                    review it.
                                                </span>
                                            </div>
                                        )}

                                        <div className="grid gap-5 md:grid-cols-2">
                                            <div className="flex min-w-0 flex-col gap-2">
                                                <Label
                                                    htmlFor="category"
                                                    className={labelClassName}
                                                >
                                                    Category
                                                </Label>
                                                <select
                                                    id="category"
                                                    name="category"
                                                    defaultValue=""
                                                    className={`${fieldClassName} w-full px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50`}
                                                    disabled={processing}
                                                >
                                                    <option value="" disabled>
                                                        Choose a category
                                                    </option>
                                                    {categories.map(
                                                        (category) => (
                                                            <option
                                                                key={category}
                                                                value={category}
                                                            >
                                                                {category}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <InputError
                                                    message={errors.category}
                                                />
                                            </div>

                                            <div className="flex min-w-0 flex-col gap-2">
                                                <Label
                                                    htmlFor="subject"
                                                    className={labelClassName}
                                                >
                                                    Subject
                                                </Label>
                                                <Input
                                                    id="subject"
                                                    name="subject"
                                                    className={fieldClassName}
                                                    placeholder="Short summary"
                                                    disabled={processing}
                                                />
                                                <InputError
                                                    message={errors.subject}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex min-w-0 flex-col gap-2">
                                            <Label
                                                htmlFor="message"
                                                className={labelClassName}
                                            >
                                                Message
                                            </Label>
                                            <Textarea
                                                id="message"
                                                name="message"
                                                className="min-h-44 rounded-lg border-slate-300 bg-white text-slate-900 shadow-none placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                                                placeholder="What did you notice? Include teams, match, page, timing or anything that helps us reproduce it."
                                                disabled={processing}
                                            />
                                            <InputError
                                                message={errors.message}
                                            />
                                        </div>

                                        <div className="flex min-w-0 flex-col gap-2">
                                            <Label
                                                htmlFor="related_url"
                                                className={labelClassName}
                                            >
                                                Related page or URL
                                            </Label>
                                            <Input
                                                id="related_url"
                                                name="related_url"
                                                className={fieldClassName}
                                                placeholder="https://mondialiq.test/matches"
                                                disabled={processing}
                                            />
                                            <InputError
                                                message={errors.related_url}
                                            />
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                disabled={processing}
                                                className="h-11 rounded-lg px-5 font-black"
                                            >
                                                <Send className="size-4" />
                                                Send feedback
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="rounded-2xl border-slate-200 bg-white shadow-xl shadow-sm">
                        <CardContent className="px-5 py-6 sm:px-6">
                            <div className="grid gap-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 ring-1 ring-slate-200">
                                    <Lock className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">
                                        Log in to submit feedback
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        Feedback is linked to your account so an
                                        admin can review the report with enough
                                        context.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                                    <Button
                                        asChild
                                        className="h-11 rounded-lg px-5 font-black"
                                    >
                                        <Link href={login.url()}>Log in</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="h-11 rounded-lg border-slate-200 px-5 font-black text-slate-700"
                                    >
                                        <Link href={register.url()}>
                                            Register
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
