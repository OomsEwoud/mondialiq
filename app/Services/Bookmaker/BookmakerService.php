<?php

namespace App\Services\Bookmaker;

use App\Models\Bookmaker;

class BookmakerService
{
    public function storeBookmakers(array $bookmakers): void
    {
        foreach ($bookmakers as $bookmaker) {
            $name = $this->bookmakerName($bookmaker);

            if ($name === null) {
                continue;
            }

            Bookmaker::query()->updateOrCreate(
                $this->bookmakerIdentity($name),
                $this->bookmakerAttributes($name),
            );
        }
    }

    private function bookmakerName(array $bookmaker): ?string
    {
        if (empty($bookmaker['name'])) {
            return null;
        }

        return $bookmaker['name'];
    }
    
    private function bookmakerIdentity(string $name): array
    {
        return [
            'name' => $name,
        ];
    }

    private function bookmakerAttributes(string $name): array
    {
        return [
            'name' => $name,
        ];
    }
}
