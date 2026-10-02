export type Game = {
    id: string;
    name: string;
    category: string | null;
    collection: string | null;
    mechanic: string | null;
    volatility: string | null;
    rtp: string | null;
    max_win_x: number | null;
    thumbnail: string | null;
    cover: string | null;
    icons: string[];
    accent: string | null;
    background: [string, string] | null;
    bonus_buy: boolean;
    free_spins: boolean;
};

export type BigWin = {
    round_id: string;
    player: string;
    game_id: string;
    game_name: string;
    thumbnail: string | null;
    icon: string | null;
    background: [string, string] | null;
    win: number;
    multiplier: number | null;
};

export type Wallet = {
    balance: number;
    in_game: boolean;
    daily_bonus_available: boolean;
    daily_bonus_amount: number;
    vip_level: VipLevel;
};

export type VipLevel = { name: string; xp: number; cashback: number; reward: number; color: string };

export type Company = {
    name: string;
    number: string;
    address: string;
    email: string;
    jurisdiction: string | null;
};
