<?php

namespace App\Filament\Resources\Concerns;

use Illuminate\Contracts\Support\Htmlable;

trait HasResourcePageSubheading
{
    public function getSubheading(): string|Htmlable|null
    {
        $resource = static::getResource();

        if (! method_exists($resource, 'getPageSubheading')) {
            return parent::getSubheading();
        }

        return $resource::getPageSubheading();
    }
}
