import { Link } from '@inertiajs/react';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { login } from '@/routes';

export default function UserPredictionLoginPrompt() {
    return (
        <div className="rounded-lg border border-border bg-card p-4 text-center">
            <LockKeyhole className="mx-auto h-5 w-5 text-blue-600" />
            <p className="mt-2 text-sm font-bold text-foreground">
                Log in to make a prediction
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
                Save your picks and track them throughout the tournament.
            </p>
            <Button asChild className="mt-4">
                <Link href={login.url()}>Log in to make a prediction</Link>
            </Button>
        </div>
    );
}
