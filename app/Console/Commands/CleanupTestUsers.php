<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

#[Signature('app:cleanup-test-users {--force : Verwijder testusers echt in plaats van dry-run}')]
#[Description('Ruim veilig testusers met een @test.be e-mailadres op')]
class CleanupTestUsers extends Command
{
    private const TEST_EMAIL_PATTERN = '%@niggers.be';

    public function handle(): int
    {
        $testUsers = $this->queryTestUsers();
        $count = (clone $testUsers)->count();

        $this->info(sprintf(
            '%d testusers gevonden met email LIKE %s.',
            $count,
            self::TEST_EMAIL_PATTERN,
        ));
        $this->showExamples();

        if (! $this->option('force')) {
            $this->warn('DRY RUN - geen users verwijderd');

            return self::SUCCESS;
        }

        $this->warn('LET OP: --force actief. Deze users worden definitief verwijderd.');
        $this->warn('Admin users worden extra gecontroleerd en overgeslagen.');

        $deleted = 0;
        $skipped = 0;
        $errors = 0;

        (clone $testUsers)
            ->select(['id', 'name', 'email'])
            ->orderBy('id')
            ->chunkById(100, function ($users) use (&$deleted, &$skipped, &$errors): void {
                foreach ($users as $user) {
                    $user->refresh();

                    if ($this->isProtectedAdmin($user)) {
                        $skipped++;
                        $this->warn("User {$user->id} overgeslagen: adminbescherming actief.");

                        continue;
                    }

                    try {
                        DB::transaction(function () use ($user): void {
                            $this->deleteUserRelatedData($user);
                            $user->delete();
                        });

                        $deleted++;
                    } catch (Throwable $exception) {
                        $errors++;
                        $this->error("User {$user->id} niet verwijderd: {$exception->getMessage()}");
                    }
                }
            });

        $this->info("{$deleted} testusers verwijderd.");

        if ($skipped > 0) {
            $this->warn("{$skipped} users overgeslagen door adminbescherming.");
        }

        if ($errors > 0) {
            $this->error("{$errors} users niet verwijderd door fouten.");
        }

        return $errors > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function queryTestUsers(): Builder
    {
        $query = User::query()
            ->where('email', 'like', self::TEST_EMAIL_PATTERN);

        if (Schema::hasColumn('users', 'is_admin')) {
            $query->where(fn (Builder $query) => $query
                ->where('is_admin', false)
                ->orWhereNull('is_admin'));
        }

        foreach (['role', 'type'] as $column) {
            if (! Schema::hasColumn('users', $column)) {
                continue;
            }

            $query->where(fn (Builder $query) => $query
                ->whereNull($column)
                ->orWhereNotIn(DB::raw("lower({$column})"), ['admin', 'super_admin']));
        }

        if (Schema::hasTable('roles') && Schema::hasTable('model_has_roles')) {
            $query->whereDoesntHave('roles', fn (Builder $query) => $query
                ->whereIn('name', ['admin', 'super_admin']));
        }

        return $query;
    }

    private function showExamples(): void
    {
        $examples = (clone $this->queryTestUsers())
            ->select(['id', 'name', 'email'])
            ->orderBy('id')
            ->limit(20)
            ->get();

        if ($examples->isEmpty()) {
            return;
        }

        $this->table(
            ['id', 'name', 'email'],
            $examples->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ])->all(),
        );
    }

    private function isProtectedAdmin(User $user): bool
    {
        if (Schema::hasColumn('users', 'is_admin') && (bool) $user->getAttribute('is_admin')) {
            return true;
        }

        foreach (['role', 'type'] as $column) {
            if (! Schema::hasColumn('users', $column)) {
                continue;
            }

            $value = $user->getAttribute($column);

            if (is_string($value) && in_array(strtolower($value), ['admin', 'super_admin'], true)) {
                return true;
            }
        }

        if (! Schema::hasTable('roles') || ! Schema::hasTable('model_has_roles')) {
            return false;
        }

        try {
            return $user->hasAnyRole(['admin', 'super_admin']);
        } catch (Throwable) {
            return true;
        }
    }

    private function deleteUserRelatedData(User $user): void
    {
        $predictionIds = collect();

        if (Schema::hasTable('predictions') && Schema::hasColumn('predictions', 'user_id')) {
            $predictionIds = DB::table('predictions')
                ->where('user_id', $user->id)
                ->pluck('id');
        }

        if (
            $predictionIds->isNotEmpty()
            && Schema::hasTable('scoreboard_predictions')
            && Schema::hasColumn('scoreboard_predictions', 'prediction_id')
        ) {
            DB::table('scoreboard_predictions')
                ->whereIn('prediction_id', $predictionIds)
                ->delete();
        }

        if (Schema::hasTable('predictions') && Schema::hasColumn('predictions', 'user_id')) {
            DB::table('predictions')
                ->where('user_id', $user->id)
                ->delete();
        }

        if (Schema::hasTable('user_preferences') && Schema::hasColumn('user_preferences', 'user_id')) {
            DB::table('user_preferences')
                ->where('user_id', $user->id)
                ->delete();
        }

        if (
            Schema::hasTable('users_has_scoreboards')
            && Schema::hasColumn('users_has_scoreboards', 'user_id')
        ) {
            DB::table('users_has_scoreboards')
                ->where('user_id', $user->id)
                ->delete();
        }

        foreach (['user_predictions', 'scoreboard_user', 'league_user', 'league_memberships'] as $table) {
            $this->deleteRowsForUser($table, $user);
        }

        if (Schema::hasTable('scoreboards') && Schema::hasColumn('scoreboards', 'owner_id')) {
            DB::table('scoreboards')
                ->where('owner_id', $user->id)
                ->update(['owner_id' => null]);
        }

        if (Schema::hasTable('feedback_messages')) {
            if (Schema::hasColumn('feedback_messages', 'user_id')) {
                DB::table('feedback_messages')
                    ->where('user_id', $user->id)
                    ->update(['user_id' => null]);
            }

            if (Schema::hasColumn('feedback_messages', 'handled_by')) {
                DB::table('feedback_messages')
                    ->where('handled_by', $user->id)
                    ->update(['handled_by' => null]);
            }
        }

        if (Schema::hasTable('sessions') && Schema::hasColumn('sessions', 'user_id')) {
            DB::table('sessions')
                ->where('user_id', $user->id)
                ->delete();
        }

        if (
            Schema::hasTable('password_reset_tokens')
            && Schema::hasColumn('password_reset_tokens', 'email')
        ) {
            DB::table('password_reset_tokens')
                ->where('email', $user->email)
                ->delete();
        }

        $this->deletePermissionAssignments($user);
    }

    private function deleteRowsForUser(string $table, User $user): void
    {
        if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'user_id')) {
            return;
        }

        DB::table($table)
            ->where('user_id', $user->id)
            ->delete();
    }

    private function deletePermissionAssignments(User $user): void
    {
        foreach (['model_has_roles', 'model_has_permissions'] as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            if (! Schema::hasColumn($table, 'model_id') || ! Schema::hasColumn($table, 'model_type')) {
                continue;
            }

            DB::table($table)
                ->where('model_id', $user->id)
                ->where('model_type', $user->getMorphClass())
                ->delete();
        }
    }
}
