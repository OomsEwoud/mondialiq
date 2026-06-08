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
                title="Privacy & cookiebeleid"
                description="Lees hoe MondialIQ omgaat met je persoonsgegevens, cookies en privacy."
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
                                Juridisch
                            </p>
                            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                Privacy & cookiebeleid
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                                Dit beleid beschrijft hoe MondialIQ omgaat met
                                persoonsgegevens, cookies en je privacyrechten.
                                Laatst bijgewerkt: 7 juni 2026.
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
                                        Privacyverklaring
                                    </p>
                                </div>
                                <CardTitle className="text-2xl font-bold text-slate-900">
                                    Hoe we met je data omgaan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5 px-5 pb-6 text-sm leading-7 text-slate-600 sm:px-6">
                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Verwerkingsverantwoordelijke
                                    </h3>
                                    <p>
                                        MondialIQ is de
                                        verwerkingsverantwoordelijke voor de
                                        persoonsgegevens die via deze website
                                        worden verzameld.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Welke gegevens verzamelen we?
                                    </h3>
                                    <p>
                                        We verzamelen alleen gegevens die nodig
                                        zijn om de dienst te leveren:
                                    </p>
                                    <ul className="mt-2 list-disc space-y-1 pl-5">
                                        <li>
                                            Accountgegevens: naam, e-mailadres
                                            (bij registratie of sociale login).
                                        </li>
                                        <li>
                                            Voorspellingen: je
                                            wedstrijdvoorspellingen worden
                                            gekoppeld aan je account.
                                        </li>
                                        <li>
                                            Feedback: wanneer je een melding
                                            indient via het contactformulier.
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Rechtsgrond
                                    </h3>
                                    <p>
                                        De verwerking is gebaseerd op uitvoering
                                        van de overeenkomst (Art. 6 lid 1 b AVG)
                                        en, waar van toepassing, toestemming
                                        (Art. 6 lid 1 a AVG) voor optionele
                                        functionaliteit zoals cookies.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Jouw rechten
                                    </h3>
                                    <p>
                                        Je hebt het recht op inzage, correctie,
                                        verwijdering, beperking van verwerking,
                                        dataportabiliteit en bezwaar. Stuur een
                                        verzoek via het contactformulier.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Bewaartermijn
                                    </h3>
                                    <p>
                                        We bewaren je gegevens niet langer dan
                                        nodig. Accountgegevens worden bewaard
                                        zolang je account actief is. Feedback
                                        wordt na afhandeling verwijderd.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <CardHeader className="gap-2 px-5 py-5 sm:px-6">
                                <div className="flex items-center gap-2 text-cyan-600">
                                    <Cookie className="size-4" />
                                    <p className="text-xs font-bold tracking-wide uppercase">
                                        Cookiebeleid
                                    </p>
                                </div>
                                <CardTitle className="text-2xl font-bold text-slate-900">
                                    Cookies en tracking
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5 px-5 pb-6 text-sm leading-7 text-slate-600 sm:px-6">
                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Functionele cookies
                                    </h3>
                                    <p>
                                        Deze cookies zijn strikt noodzakelijk
                                        voor het functioneren van de website
                                        (bijv. sessiebeheer, beveiliging,
                                        CSRF-bescherming). Ze worden geplaatst
                                        zonder voorafgaande toestemming.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Analytische cookies
                                    </h3>
                                    <p>
                                        We gebruiken Atbound voor statistische
                                        analyse van bezoekersgedrag. Deze
                                        cookies worden pas geplaatst nadat je
                                        actief toestemming hebt gegeven via de
                                        cookiebanner.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Marketing cookies
                                    </h3>
                                    <p>
                                        Momenteel plaatst MondialIQ geen
                                        marketing- of advertentiecookies van
                                        derden. Mocht dit in de toekomst
                                        veranderen, dan wordt dit altijd vooraf
                                        via de cookiebanner aangevraagd.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-base font-bold text-slate-900">
                                        Cookievoorkeuren aanpassen
                                    </h3>
                                    <p>
                                        Je kunt je cookievoorkeuren op elk
                                        moment wijzigen of intrekken via de knop
                                        &quot;Cookievoorkeuren&quot; in de
                                        footer van elke pagina.
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
                                        Samenvatting
                                    </p>
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">
                                    In het kort
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-5 pb-6 text-sm leading-7 text-slate-600 sm:px-6">
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                                            1
                                        </span>
                                        <span>
                                            We verzamelen alleen minimale
                                            persoonsgegevens die nodig zijn voor
                                            de dienst.
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                                            2
                                        </span>
                                        <span>
                                            Functionele cookies zijn altijd
                                            actief; analytische cookies vereisen
                                            toestemming.
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                                            3
                                        </span>
                                        <span>
                                            Je gegevens worden niet verkocht aan
                                            derden.
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                                            4
                                        </span>
                                        <span>
                                            Je kunt je account en gegevens op
                                            elk moment laten verwijderen.
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                                            5
                                        </span>
                                        <span>
                                            Geen marketingcookies zonder
                                            expliciete toestemming.
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
