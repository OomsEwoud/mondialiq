import {
    BarChart3,
    CheckCircle2,
    CircleHelp,
    Info,
    ListOrdered,
    ShieldCheck,
    Trophy,
    XCircle,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/overlays/dialog';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const pointsRules = [
    {
        label: 'Win',
        points: '+3 pts',
        description: 'Three points for a victory.',
    },
    {
        label: 'Draw',
        points: '+1 pt',
        description: 'One point for each team.',
    },
    {
        label: 'Loss',
        points: '+0 pts',
        description: 'No points for a defeat.',
    },
];

const tableColumns = [
    ['P', 'Played matches'],
    ['W', 'Wins'],
    ['D', 'Draws'],
    ['L', 'Losses'],
    ['GD', 'Goal difference'],
    ['PTS', 'Points'],
] as const;

const qualificationRules = [
    {
        label: 'Top 2',
        status: 'Qualified',
        description: 'The first two teams in every group go through automatically.',
        tone: 'qualified',
    },
    {
        label: 'Best 3rd top 8',
        status: 'Qualified',
        description: 'The best eight third-placed teams also reach the Round of 32.',
        tone: 'qualified',
    },
    {
        label: 'Others',
        status: 'Not qualified',
        description: 'The remaining third-placed teams and all fourth-placed teams are eliminated.',
        tone: 'eliminated',
    },
] as const;

const thirdPlaceRanks = Array.from({ length: 12 }, (_, index) => index + 1);

export default function StandingsExplanationModal({
    open,
    onOpenChange,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[2rem] border-cyan-100 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.18),transparent_18rem),radial-gradient(circle_at_bottom_left,rgba(29,78,216,0.08),transparent_20rem),linear-gradient(180deg,rgba(255,255,255,0.995),rgba(248,250,252,0.985))] p-0 shadow-2xl shadow-cyan-950/15 sm:max-w-5xl">
                <div className="border-b border-cyan-100/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(240,249,255,0.96))] px-5 py-6 sm:px-7 sm:py-7">
                    <DialogHeader className="gap-3 pr-8 text-left">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div className="min-w-0">
                                <div className="flex size-14 items-center justify-center rounded-[1.35rem] bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100 shadow-sm shadow-cyan-950/5">
                                    <Trophy className="size-6" />
                                </div>
                                <p className="mt-4 text-xs font-black tracking-[0.24em] text-cyan-700 uppercase">
                                    Group Standings
                                </p>
                                <DialogTitle className="mt-2 text-4xl font-black tracking-tight text-blue-950 sm:text-5xl">
                                    How standings work
                                </DialogTitle>
                                <DialogDescription className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                                    A clear guide to points, table columns,
                                    qualification rules and model outlooks on
                                    the World Cup 2026 standings page.
                                </DialogDescription>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[22rem] lg:max-w-md">
                                <HeroStat label="Groups" value="12" />
                                <HeroStat label="Teams each" value="4" />
                                <HeroStat label="Advance" value="Top 2 + 8 best 3rd" />
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
                    <section className="rounded-[1.8rem] border border-cyan-100 bg-white p-5 shadow-sm shadow-cyan-950/5">
                        <div className="flex items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                                <ListOrdered className="size-5" />
                            </span>
                            <div>
                                <SectionEyebrow>Group format</SectionEyebrow>
                                <h2 className="mt-1 text-2xl font-black text-blue-950 sm:text-3xl">
                                    How group standings work
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                                    Each World Cup group contains four teams.
                                    Teams are ranked by their match results
                                    during the group stage.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[1.8rem] border border-cyan-100 bg-white p-5 shadow-sm shadow-cyan-950/5">
                        <div className="flex items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                                <Trophy className="size-5" />
                            </span>
                            <div className="min-w-0">
                                <SectionEyebrow>Points</SectionEyebrow>
                                <h2 className="mt-1 text-2xl font-black text-blue-950 sm:text-3xl">
                                    Points system
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Teams earn points from every group-stage
                                    match.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            {pointsRules.map((rule) => (
                                <div
                                    key={rule.label}
                                    className="rounded-[1.45rem] border border-cyan-100 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.08),transparent_10rem),linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,0.98))] p-4 shadow-sm shadow-cyan-950/5"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-lg font-black text-blue-950">
                                            {rule.label}
                                        </h3>
                                        <span className="rounded-full border border-cyan-200 bg-[linear-gradient(180deg,rgba(236,254,255,1),rgba(207,250,254,0.88))] px-3 py-1 text-xs font-black text-cyan-800">
                                            {rule.points}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {rule.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-[1.8rem] border border-cyan-100 bg-white p-5 shadow-sm shadow-cyan-950/5">
                        <div className="flex items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                                <CircleHelp className="size-5" />
                            </span>
                            <div>
                                <SectionEyebrow>Columns</SectionEyebrow>
                                <h2 className="mt-1 text-2xl font-black text-blue-950 sm:text-3xl">
                                    Table columns
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    These short labels help you read the table
                                    quickly.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {tableColumns.map(([code, meaning]) => (
                                <div
                                    key={code}
                                    className="rounded-[1.3rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,0.96))] p-4 shadow-sm shadow-cyan-950/5"
                                >
                                    <p className="text-2xl font-black text-blue-950">
                                        {code}
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        {meaning}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-[1.8rem] border border-cyan-100 bg-white p-5 shadow-sm shadow-cyan-950/5">
                        <div className="flex items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                                <ShieldCheck className="size-5" />
                            </span>
                            <div>
                                <SectionEyebrow>Qualification</SectionEyebrow>
                                <h2 className="mt-1 text-2xl font-black text-blue-950 sm:text-3xl">
                                    Qualification
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Group position decides whether a team keeps
                                    going or leaves the tournament.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 lg:grid-cols-3">
                            {qualificationRules.map((rule) => (
                                <div
                                    key={rule.label}
                                    className="rounded-[1.45rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,0.96))] p-4 shadow-sm shadow-cyan-950/5"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-lg font-black text-blue-950">
                                            {rule.label}
                                        </p>
                                        <span
                                            className={
                                                rule.tone === 'qualified'
                                                    ? 'rounded-full border border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,1),rgba(209,250,229,0.82))] px-3 py-1 text-xs font-black text-emerald-800'
                                                    : 'rounded-full border border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,1),rgba(254,205,211,0.78))] px-3 py-1 text-xs font-black text-rose-700'
                                            }
                                        >
                                            {rule.status}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {rule.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[1.8rem] border border-cyan-100 bg-white shadow-sm shadow-cyan-950/5">
                        <div className="border-b border-cyan-100 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.12),transparent_14rem),linear-gradient(180deg,rgba(248,255,255,0.94),rgba(255,255,255,0.98))] p-5">
                            <div className="flex items-start gap-3">
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                                    <CheckCircle2 className="size-5" />
                                </span>
                                <div>
                                    <SectionEyebrow>Cross-group ranking</SectionEyebrow>
                                    <h2 className="mt-1 text-2xl font-black text-blue-950 sm:text-3xl">
                                        Best 3rd ranking
                                    </h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                        The Best 3rd ranking compares all teams
                                        that finish third in their group. The
                                        top eight in that ranking advance to the
                                        Round of 32.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                            <div className="rounded-[1.45rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(248,255,255,0.98),rgba(255,255,255,0.98))] p-4 shadow-sm shadow-cyan-950/5">
                                <p className="text-sm font-black tracking-[0.16em] text-cyan-700 uppercase">
                                    Quick view
                                </p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                                    <MiniInfoCard
                                        title="12 teams"
                                        body="Every group sends one third-placed team into this comparison."
                                    />
                                    <MiniInfoCard
                                        title="Top 8"
                                        body="Only the strongest eight continue into the knockout stage."
                                    />
                                    <MiniInfoCard
                                        title="Cutoff"
                                        body="Rank #8 is the last safe place in the table."
                                    />
                                </div>
                            </div>

                            <div className="rounded-[1.45rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(248,255,255,0.98),rgba(255,255,255,0.98))] p-4 shadow-sm shadow-cyan-950/5">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="text-sm font-black text-blue-950">
                                        12 third-placed teams
                                    </p>
                                    <p className="text-xs font-black tracking-[0.18em] text-slate-400 uppercase">
                                        Top 8 advance
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    {thirdPlaceRanks.map((rank) => (
                                        <div key={rank}>
                                            <div
                                                className={
                                                    rank <= 8
                                                        ? 'flex items-center justify-between rounded-2xl border border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,1),rgba(209,250,229,0.82))] px-3 py-2 text-sm font-black text-emerald-800 shadow-sm shadow-emerald-950/5'
                                                        : 'flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-600'
                                                }
                                            >
                                                <span>Rank #{rank}</span>
                                                <span>
                                                    {rank <= 8
                                                        ? 'Qualified'
                                                        : 'Eliminated'}
                                                </span>
                                            </div>
                                            {rank === 8 && (
                                                <div className="my-2 flex items-center gap-3 text-[11px] font-black tracking-[0.18em] text-amber-600 uppercase">
                                                    <span className="h-px flex-1 bg-amber-200" />
                                                    <span>Cutoff line</span>
                                                    <span className="h-px flex-1 bg-amber-200" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[1.8rem] border border-cyan-100 bg-white p-5 shadow-sm shadow-cyan-950/5">
                        <div className="flex items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                                <BarChart3 className="size-5" />
                            </span>
                            <div>
                                <SectionEyebrow>Model outlook</SectionEyebrow>
                                <h2 className="mt-1 text-2xl font-black text-blue-950 sm:text-3xl">
                                    Qualification probability
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Qualification probability is a model
                                    outlook. It estimates how likely a team is
                                    to advance, but it is not a certainty.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                            <div className="rounded-[1.4rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(248,255,255,0.98),rgba(255,255,255,0.98))] p-4 shadow-sm shadow-cyan-950/5">
                                <p className="text-sm font-black text-blue-950">
                                    Official ranking
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Based on real match results, points and
                                    standings positions.
                                </p>
                            </div>
                            <div className="rounded-[1.4rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(248,255,255,0.98),rgba(255,255,255,0.98))] p-4 shadow-sm shadow-cyan-950/5">
                                <p className="text-sm font-black text-blue-950">
                                    Model outlook
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    A prediction estimate based on the model,
                                    not an official tournament decision.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-start gap-3 rounded-[1.45rem] border border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,1),rgba(253,230,138,0.45))] p-4 shadow-sm shadow-amber-950/5">
                            <Info className="mt-0.5 size-5 shrink-0 text-amber-700" />
                            <p className="text-sm font-black text-amber-900">
                                Model outlooks are estimates, not guarantees.
                            </p>
                        </div>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function SectionEyebrow({ children }: { children: string }) {
    return (
        <p className="text-xs font-black tracking-[0.18em] text-cyan-700 uppercase">
            {children}
        </p>
    );
}

function HeroStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[1.25rem] border border-cyan-100 bg-white/85 px-3 py-3 text-left shadow-sm shadow-cyan-950/5 backdrop-blur">
            <p className="text-[11px] font-black tracking-[0.16em] text-slate-400 uppercase">
                {label}
            </p>
            <p className="mt-1 text-sm font-black leading-5 text-blue-950">
                {value}
            </p>
        </div>
    );
}

function MiniInfoCard({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm shadow-cyan-950/5">
            <p className="text-sm font-black text-blue-950">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
        </div>
    );
}
