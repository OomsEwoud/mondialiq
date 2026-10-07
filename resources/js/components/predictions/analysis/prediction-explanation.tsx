export default function PredictionExplanation({
    advice,
}: {
    advice: string | null;
}) {
    return (
        <section aria-labelledby="explanation-heading" className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
                AI-interpretatie
            </p>
            <h2
                id="explanation-heading"
                className="mt-2 text-2xl font-semibold tracking-tight text-foreground"
            >
                Waarom deze voorspelling?
            </h2>
            <div className="mt-6 border-l-2 border-primary/40 pl-5 sm:pl-6">
                <p className="text-base leading-8 break-words whitespace-pre-line text-foreground/85">
                    {advice ??
                        'Er is nog geen toelichting beschikbaar voor deze voorspelling.'}
                </p>
            </div>
        </section>
    );
}
