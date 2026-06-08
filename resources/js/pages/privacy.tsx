import { Cookie, FileText, Lock, Shield } from 'lucide-react';
import PageHead from '@/components/seo/page-head';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';

export default function Privacy() {
    return (
        <>
            <PageHead
                title="Privacy & Cookie Policy"
                description="Read how MondialIQ handles your personal data, cookies, and privacy."
                noIndex
            />

            <div className="space-y-6">
                <section className="rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-lg sm:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-slate-800 text-cyan-300">
                                <Shield className="size-5" />
                            </div>
                            <p className="text-xs font-semibold tracking-wide text-cyan-300 uppercase">
                                Legal
                            </p>
                            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                Privacy & Cookie Policy
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                                This policy describes how MondialIQ handles
                                personal data, cookies, and your privacy rights.
                                Last updated: June 7, 2026.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-6">
                        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <CardHeader className="gap-2 px-5 py-5 sm:px-6">
                                <div className="flex items-center gap-2 text-cyan-600">
                                    <Lock className="size-4" />
                                    <p className="text-xs font-bold tracking-wide uppercase">
                                        Privacy Statement
                                    </p>
                                </div>
                                <CardTitle className="text-2xl font-bold text-slate-900">
                                    How we handle your data
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5 px-5 pb-6 text-sm leading-7 text-slate-600 sm:px-6">
                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Data Controller
                                    </h3>
                                    <p>
                                        MondialIQ is the data controller for the
                                        personal data collected through this
                                        website.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        What data do we collect?
                                    </h3>
                                    <p>
                                        We only collect data necessary to
                                        provide the service:
                                    </p>
                                    <ul className="mt-2 list-disc space-y-1 pl-5">
                                        <li>
                                            Account data: name, email address
                                            (upon registration or social login).
                                        </li>
                                        <li>
                                            Predictions: your match predictions
                                            are linked to your account.
                                        </li>
                                        <li>
                                            Feedback: when you submit a message
                                            via the contact form.
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Legal Basis
                                    </h3>
                                    <p>
                                        Processing is based on the performance
                                        of a contract (Art. 6(1)(b) GDPR) and,
                                        where applicable, consent (Art. 6(1)(a)
                                        GDPR) for optional functionality such as
                                        cookies.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Your Rights
                                    </h3>
                                    <p>
                                        You have the right to access,
                                        rectification, erasure, restriction of
                                        processing, data portability, and
                                        objection. Send a request via the
                                        contact form.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Retention Period
                                    </h3>
                                    <p>
                                        We do not retain your data longer than
                                        necessary. Account data is retained as
                                        long as your account is active. Feedback
                                        is deleted after it has been handled.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <CardHeader className="gap-2 px-5 py-5 sm:px-6">
                                <div className="flex items-center gap-2 text-cyan-600">
                                    <Cookie className="size-4" />
                                    <p className="text-xs font-bold tracking-wide uppercase">
                                        Cookie Policy
                                    </p>
                                </div>
                                <CardTitle className="text-2xl font-bold text-slate-900">
                                    Cookies and tracking
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5 px-5 pb-6 text-sm leading-7 text-slate-600 sm:px-6">
                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Functional cookies
                                    </h3>
                                    <p>
                                        These cookies are strictly necessary for
                                        the website to function (e.g., session
                                        management, security, CSRF protection).
                                        They are placed without prior consent.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Analytical cookies
                                    </h3>
                                    <p>
                                        We use Atbound for statistical analysis
                                        of visitor behavior. These cookies are
                                        only placed after you have actively
                                        given consent via the cookie banner.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Marketing cookies
                                    </h3>
                                    <p>
                                        Currently, MondialIQ does not place any
                                        third-party marketing or advertising
                                        cookies. Should this change in the
                                        future, it will always be requested in
                                        advance via the cookie banner.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Adjusting cookie preferences
                                    </h3>
                                    <p>
                                        You can change or withdraw your cookie
                                        preferences at any time via the
                                        &quot;Cookie preferences&quot; button in
                                        the footer of every page.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <aside className="space-y-6">
                        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <CardHeader className="gap-3 px-5 py-5 sm:px-6">
                                <div className="flex items-center gap-2 text-cyan-600">
                                    <FileText className="size-4" />
                                    <p className="text-xs font-bold tracking-wide uppercase">
                                        Summary
                                    </p>
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">
                                    In brief
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-5 pb-6 text-sm leading-7 text-slate-600 sm:px-6">
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                                            1
                                        </span>
                                        <span>
                                            We only collect minimal personal
                                            data necessary for the service.
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                                            2
                                        </span>
                                        <span>
                                            Functional cookies are always
                                            active; analytical cookies require
                                            consent.
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                                            3
                                        </span>
                                        <span>
                                            Your data is not sold to third
                                            parties.
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                                            4
                                        </span>
                                        <span>
                                            You can have your account and data
                                            deleted at any time.
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                                            5
                                        </span>
                                        <span>
                                            No marketing cookies without
                                            explicit consent.
                                        </span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </>
    );
}
