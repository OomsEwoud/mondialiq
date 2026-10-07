import { Form, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Lock, Send } from 'lucide-react';
import StoreFeedbackController from '@/actions/App/Http/Controllers/Feedback/StoreFeedbackController';
import InputError from '@/components/forms/input-error';
import PageHead from '@/components/seo/page-head';
import PageHeader from '@/components/typography/page-header';
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
    'h-11 rounded-lg border-input bg-card text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring';
const labelClassName =
    'text-xs font-semibold tracking-wide text-muted-foreground uppercase';

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
                <PageHeader
                    eyebrow="Support"
                    title="Contact & feedback"
                    description="Found incorrect data or need help? Send a report linked to your account so we can help you."
                />

                {user ? (
                    <Card className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 shadow-sm">
                        <CardHeader className="gap-2 px-5 py-5 sm:px-6">
                            <CardTitle className="text-2xl font-bold text-foreground">
                                Send a report
                            </CardTitle>
                            <CardDescription className="max-w-2xl text-sm leading-6 text-muted-foreground">
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
                                                className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-950/40 px-4 py-3 text-sm font-semibold text-emerald-200"
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
                                                className="min-h-44 rounded-lg border-input bg-card text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring"
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
                                                className="h-11 rounded-lg px-5 font-semibold"
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
                    <Card className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 shadow-sm">
                        <CardContent className="px-5 py-6 sm:px-6">
                            <div className="grid gap-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary shadow-sm">
                                    <Lock className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">
                                        Log in to submit feedback
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        Feedback is linked to your account so an
                                        admin can review the report with enough
                                        context.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                                    <Button
                                        asChild
                                        className="h-11 rounded-lg px-5 font-semibold"
                                    >
                                        <Link href={login.url()}>Log in</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="h-11 rounded-lg border-border px-5 font-semibold text-foreground"
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
