# NimGames.net

NimGames.net is an interactive educational website for learning and exploring game theory, especially as it applies to competitive programming and combinatorial games. The site provides a hands-on experience with classic impartial games, allowing users to play against the computer or challenge other players live online.

## Features

- **Interactive Game Theory Playground:** Learn the fundamentals of combinatorial game theory through play and experimentation.
- **Play Against the Computer:** Test your strategies against a computer opponent with optimal play.
- **Live Multiplayer:** Play real-time games against other users from around the world.
- **Educational Content:** In-depth articles and tutorials explaining the theory and strategies behind each game.

## Supported Games

- **Nim:** The classic game of removing stones from piles, foundational to combinatorial game theory.
- **Marbles:** Take turns removing one to three marbles and win if you remove the last one.
- **Lone Knight:** Move a single knight on a chessboard with restricted moves.
- **Multi Knight:** Multiple knights on a chessboard with restricted moves.

## Getting Started

Visit [https://nimgames.net](https://nimgames.net) to start playing and learning.

### Local Development

1. **Install dependencies:**
   ```
   npm install
   ```
2. **Start the development server:**
   ```
   npm run dev
   ```
3. **(Optional) Start the WebSocket server for live play:**
   ```
   npm run start:ws
   ```
4. Open your browser to [http://localhost:3000](http://localhost:3000).

### Production

- The site is hosted at [https://nimgames.net](https://nimgames.net).
- Nginx is used as a reverse proxy for both the Next.js frontend and the WebSocket backend.

## Project Structure

- `app/` – Next.js application pages and components
- `games/` – Game logic implementations
- `websocket/` – WebSocket server and client utilities
- `types/` – Shared TypeScript types
- `public/` – Static assets

## License

This project is for educational purposes.

---

Explore, play, and master the art of combinatorial games at [nimgames.net](https://nimgames.net)!
