<?php

namespace App\Services\MachineLearning;

use App\Services\Football\CompetitionConfig;
use Carbon\CarbonImmutable;
use InvalidArgumentException;

class HistoricalFixtureContract
{
    public function checksum(array $payload): string
    {
        return hash('sha256', json_encode($this->canonical($payload), JSON_THROW_ON_ERROR));
    }

    private function canonical(array $value): array
    {
        if (! array_is_list($value)) {
            ksort($value);
        }
        foreach ($value as $key => $item) {
            if (is_array($item)) {
                $value[$key] = $this->canonical($item);
            }
        }

        return $value;
    }

    public function validate(array $rows, CompetitionConfig $competition): array
    {
        if ($rows === []) {
            throw new InvalidArgumentException('Empty season response cannot prove completeness.');
        }
        $ids = [];
        foreach ($rows as $row) {
            foreach (['fixture.id', 'teams.home.id', 'teams.away.id'] as $field) {
                $value = data_get($row, $field);
                if (! is_int($value) || $value <= 0 || ($field === 'fixture.id' && $value >= 99000000 && $value <= 99000999)) {
                    throw new InvalidArgumentException('Invalid provider identity: '.$field);
                }
            }
            $id = $row['fixture']['id'];
            if (isset($ids[$id]) || $row['teams']['home']['id'] === $row['teams']['away']['id']) {
                throw new InvalidArgumentException('Duplicate fixture or identical teams.');
            }
            $ids[$id] = true;
            if (data_get($row, 'league.id') !== $competition->leagueId || data_get($row, 'league.season') !== $competition->season) {
                throw new InvalidArgumentException('Response contains another league or season.');
            }
            foreach (['league.name', 'league.round', 'teams.home.name', 'teams.away.name', 'teams.home.logo', 'teams.away.logo', 'fixture.status.long'] as $field) {
                if (! is_string(data_get($row, $field)) || trim(data_get($row, $field)) === '') {
                    throw new InvalidArgumentException('Missing required field: '.$field);
                }
            }
            $date = data_get($row, 'fixture.date');
            if (! is_string($date) || ! preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/D', $date)) {
                throw new InvalidArgumentException('Kickoff must be an ISO datetime with timezone.');
            }
            $kickoff = CarbonImmutable::parse($date);
            if ($kickoff->format('Y-m-d\TH:i:s') !== substr($date, 0, 19)
                || ! is_int(data_get($row, 'fixture.timestamp')) || $kickoff->timestamp !== $row['fixture']['timestamp']) {
                throw new InvalidArgumentException('Invalid kickoff or timestamp mismatch.');
            }
            $status = data_get($row, 'fixture.status.short');
            if (! in_array($status, ['TBD', 'NS', '1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO', 'LIVE'], true)) {
                throw new InvalidArgumentException('Unknown fixture status.');
            }
            foreach (['home', 'away'] as $side) {
                $score = data_get($row, 'score.fulltime.'.$side);
                if (($score !== null && (! is_int($score) || $score < 0 || $score > 50)) || ($status === 'FT' && $score === null)) {
                    throw new InvalidArgumentException('Invalid or missing fulltime score.');
                }
                if ($status === 'FT' && data_get($row, 'goals.'.$side) !== $score) {
                    throw new InvalidArgumentException('Conflicting FT score fields.');
                }
            }
            if ($status === 'FT' && $kickoff->addHours(4)->isFuture()) {
                throw new InvalidArgumentException('FT result is inside completion buffer or in the future.');
            }
        }
        usort($rows, fn (array $a, array $b): int => [$a['fixture']['timestamp'], $a['fixture']['id']] <=> [$b['fixture']['timestamp'], $b['fixture']['id']]);

        return $rows;
    }
}
