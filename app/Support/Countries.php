<?php

namespace App\Support;

class Countries
{
    /**
     * Countries a player may register from, sorted by name.
     *
     * @return array<int, array{code: string, name: string, dial: string}>
     */
    public static function allowed(): array
    {
        $restricted = array_map('strtoupper', config('countries.restricted', []));

        return collect(config('countries.list'))
            ->reject(fn ($_, string $code) => in_array($code, $restricted, true))
            ->map(fn (array $c, string $code) => ['code' => $code, 'name' => $c[0], 'dial' => $c[1]])
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values()
            ->all();
    }

    /**
     * Every country (for phone dial codes — a player may hold a foreign number).
     *
     * @return array<int, array{code: string, name: string, dial: string}>
     */
    public static function all(): array
    {
        return collect(config('countries.list'))
            ->map(fn (array $c, string $code) => ['code' => $code, 'name' => $c[0], 'dial' => $c[1]])
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values()
            ->all();
    }

    /** @return array<int, string> */
    public static function allowedCodes(): array
    {
        return array_column(self::allowed(), 'code');
    }

    public static function dial(string $code): ?string
    {
        return config("countries.list.{$code}.1");
    }

    public static function name(?string $code): ?string
    {
        return $code ? config("countries.list.{$code}.0") : null;
    }
}
