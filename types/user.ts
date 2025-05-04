export interface User {
    createdat: string;
    email: string;
    games: number;
    userid: number;
    username: string;
    name: string;
    nim_5m_games: number;
    nim_5m_wins: number;
    nim_1m_games: number;
    nim_1m_wins: number;
    nim_15s_games: number;
    nim_15s_wins: number;
    marbles_5m_games: number;
    marbles_5m_wins: number;
    marbles_1m_games: number;
    marbles_1m_wins: number;
    marbles_15s_games: number;
    marbles_15s_wins: number;
    multiknight_5m_games: number;
    multiknight_5m_wins: number;
    multiknight_1m_games: number;
    multiknight_1m_wins: number;
    multiknight_15s_games: number;
    multiknight_15s_wins: number;
}

export interface UserProfile {
    createdat: Date;
    games: number;
    username: string;
    name: string;
    nim_5m_games: number;
    nim_5m_wins: number;
    nim_1m_games: number;
    nim_1m_wins: number;
    nim_15s_games: number;
    nim_15s_wins: number;
    marbles_5m_games: number;
    marbles_5m_wins: number;
    marbles_1m_games: number;
    marbles_1m_wins: number;
    marbles_15s_games: number;
    marbles_15s_wins: number;
    multiknight_5m_games: number;
    multiknight_5m_wins: number;
    multiknight_1m_games: number;
    multiknight_1m_wins: number;
    multiknight_15s_games: number;
    multiknight_15s_wins: number;
}

// usernames are alphanumeric and can contain underscores
// and must be between 3 and 20 characters long
// and must start with a letter
export function isValidUsername(username: string): boolean {
    const regex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
    return regex.test(username);
}

// emails must be valid emails
export function isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

