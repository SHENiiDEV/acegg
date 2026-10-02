<?php

namespace App\Support;

/**
 * Shrinks a SpinKit game summary to what the lobby cards need.
 */
class GamePresenter
{
    /**
     * @param  array<string, mixed>  $g
     * @return array<string, mixed>
     */
    public static function card(array $g): array
    {
        $features = $g['features'] ?? [];

        return [
            'id' => $g['game_id'],
            'name' => $g['name'],
            'category' => $g['category'] ?? null,
            'collection' => $g['collection'] ?? null,
            'mechanic' => $g['mechanic'] ?? null,
            'volatility' => $g['volatility'] ?? null,
            'rtp' => $g['rtp'] ?? null,
            'max_win_x' => $g['max_win_x'] ?? null,
            'thumbnail' => $g['thumbnail_url'] ?? null,
            'cover' => $g['cover_image'] ?? null,
            'icons' => $g['thumbnail_icons'] ?? [],
            'accent' => $g['theme']['accent'] ?? null,
            'background' => $g['theme']['background'] ?? null,
            'bonus_buy' => (bool) ($features['feature_buy'] ?? false),
            'free_spins' => (bool) ($features['free_spins'] ?? false),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $games
     * @return array<int, array<string, mixed>>
     */
    public static function cards(array $games): array
    {
        return array_values(array_map(self::card(...), $games));
    }
}
