<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'category',
    'subject',
    'message',
    'related_url',
    'handled_at',
    'handled_by',
])]
class FeedbackMessage extends Model
{
    protected function casts(): array
    {
        return [
            'handled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function handledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }

    public function isHandled(): bool
    {
        return $this->handled_at !== null;
    }

    public function markAsHandled(User $user): void
    {
        $this->forceFill([
            'handled_at' => now(),
            'handled_by' => $user->id,
        ])->save();
    }

    public function markAsOpen(): void
    {
        $this->forceFill([
            'handled_at' => null,
            'handled_by' => null,
        ])->save();
    }
}
