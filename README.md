# ♟️ Full-Stack Multiplayer Chess Engine

A robust, real-time multiplayer chess platform featuring live WebSocket matchmaking, session recovery, an integrated AI opponent, and tournament support. 

## ✨ Features

* **Real-Time Multiplayer:** Create and join private rooms using 4-character invite codes. Moves are broadcasted with near-zero latency using WebSockets (STOMP).
* **AI Opponent:** Test your skills against a custom-integrated Minimax AI engine with adjustable difficulty levels (Easy, Medium, Hard).
* **Bulletproof Session Recovery:** Accidentally refreshed the page? No problem. The engine uses namespaced browser `localStorage` to save raw PGN data, instantly rebuilding the board and reconnecting to the WebSocket stream so you never lose a game.
* **Tournament Mode:** Enforces strict server-side role assignments (White/Black) based on database pairings, preventing players from manipulating the board.
* **Dynamic Customization:** Switch between multiple board themes and piece styles on the fly, complete with synthesizer sound effects.
* **Move Validation:** Fully validated move generation utilizing `chess.js` on the client and Java-based rule enforcement on the backend.

## 🛠️ Tech Stack

**Frontend**
* React.js (Vite)
* `chess.js` (Move generation & PGN handling)
* `@stomp/stompjs` & `sockjs-client` (WebSocket connection)
* CSS Grid & Flexbox (Responsive UI)

**Backend**
* Java 17 / Spring Boot 3
* Spring WebSocket (STOMP message broker)
* ConcurrentHashMap (High-performance in-memory room management)
* Spring Data JPA (Tournament & User Management)

## 🚀 Running Locally

### Prerequisites
* Node.js (v18+)
* Java Development Kit (JDK 17+)
* Maven

### 1. Start the Backend (Spring Boot)
Navigate to the backend directory and run the Spring Boot application:
```bash
cd backend-springboot
./mvnw spring-boot:run
The server will start on http://localhost:8080.

2. Start the Frontend (React)
Open a new terminal, navigate to the frontend directory, install dependencies, and start the Vite dev server:

Bash
cd frontend-react
npm install
npm run dev
The application will be available at http://localhost:5173.

⚙️ Environment Variables
To run the frontend, ensure you have a .env file in the frontend-react directory:

Code snippet
# Point this to your backend server
VITE_BACKEND_URL=http://localhost:8080
🌐 Deployment Notes
When deploying this application to production (e.g., Vercel for Frontend, Render/Railway for Backend):

Environment Variables: Update the VITE_BACKEND_URL in your frontend hosting platform to point to your live Spring Boot URL.

CORS & WebSockets: Ensure your Spring Boot WebSocketConfig.java and REST Controllers are updated to allow origins from your live frontend URL.

State Management: Currently, active multiplayer rooms are stored in the server's RAM. If deployed on a free-tier hosting service that spins down during inactivity, active matches will be cleared upon server restart.

👨‍💻 Author
Nisarg Singh Thakur
