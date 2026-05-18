import { Link } from '@inertiajs/react';
import { LockKeyhole } from 'lucide-react';
import { login } from '@/routes';
import { Button } from '@/components/ui/forms/button';

export default function UserPredictionLoginPrompt() {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
            <LockKeyhole className="mx-auto h-5 w-5 text-blue-600" />
            <p className="mt-2 text-sm font-bold text-slate-900">
                Log in to make a prediction
            </p>
            <p className="mt-1 text-sm text-slate-500">
                Save your picks and track them throughout the tournament.
            </p>
            <Button asChild className="mt-4">
                <Link href={login.url()}>Log in to make a prediction</Link>
            </Button>
        </div>
    );
}
