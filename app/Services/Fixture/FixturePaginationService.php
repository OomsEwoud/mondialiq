<?php

namespace App\Services\Fixture;

use App\Http\Resources\FixtureResource;
use App\Models\Fixture;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class FixturePaginationService
{
    public function paginate(Builder $query, int $perPage = 10): LengthAwarePaginator
    {
        return $query
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Fixture $fixture) => FixtureResource::make($fixture)->resolve());
    }
}
