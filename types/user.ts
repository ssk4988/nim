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
}

// usernames are alphanumeric and can contain underscores
// and must be between 3 and 20 characters long
// and must start with a letter
export function validUsername(username: string): boolean {
    const regex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
    return regex.test(username);
}

// emails must be valid emails
export function validEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export function isUser(user: any): user is User {
    return (
        typeof user === "object" &&
        user !== null &&
        typeof user.createdat === "string" &&
        typeof user.email === "string" &&
        typeof user.games === "number" &&
        typeof user.userid === "number" &&
        typeof user.username === "string" &&
        typeof user.name === "string" &&
        typeof user.nim_5m_games === "number" &&
        typeof user.nim_5m_wins === "number" &&
        typeof user.nim_1m_games === "number" &&
        typeof user.nim_1m_wins === "number" &&
        typeof user.nim_15s_games === "number" &&
        typeof user.nim_15s_wins === "number"
    );
}
