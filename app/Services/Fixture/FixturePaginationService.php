<?php

namespace App\Services\Fixture;

use App\Http\Resources\FixtureResource;
use App\Models\Fixture;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class FixturePaginationService
{
    private const DEFAULT_PER_PAGE = 10;

    public function paginate(Builder $query, int $perPage = self::DEFAULT_PER_PAGE): LengthAwarePaginator
    {
        return $query
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Fixture $fixture) => $this->resource($fixture));
    }

    private function resource(Fixture $fixture): array
    {
        return FixtureResource::make($fixture)->resolve();
    }
}
