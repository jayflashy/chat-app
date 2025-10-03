
# Chat App Backend

A real-time chat application backend built with Node.js, Express, TypeScript, MongoDB, and Socket.IO.

## � Features

- **Real-time messaging** with Socket.IO
- **User authentication** with JWT
- **MongoDB database** with Mongoose
- **TypeScript** for type safety
- **Structured logging** with Pino
- **File uploads** with Multer
- **Rate limiting** and security middleware
- **Modular architecture** for scalability

## �📁 Project Structure

```
├── src/
│   ├── config/           # Database and app configuration
│   ├── middleware/       # Custom middleware (auth, error handling)
│   ├── modules/          # Feature modules (user, chat, message)
│   │   ├── auth/         # Auth module
│   │   ├── user/         # User module
│   │   ├── chat/         # Chat module
│   │   └── message/      # Message module
│   ├── sockets/          # Socket.IO event handlers
│   ├── utils/            # Utility functions and helpers
│   └── server.ts         # Main server file
├── uploads/              # File storage directory
├── .env.example          # Environment variables template
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## 🛠️ Tech Stack

- Runtime: Node.js
- Framework: Express.js
- Language: TypeScript
- Database: MongoDB with Mongoose
- Real-time: Socket.IO
- Authentication: JWT (jsonwebtoken)
- Password Hashing: bcryptjs
- File Uploads: Multer
- Logging: Pino
- Security: Helmet, CORS, Rate Limiting
- Validation: express-validator

## 📦 Quick Start

1. Clone the repository and install dependencies:

```powershell
git clone <repository-url>
cd chat-app
pnpm install
# or with pnpm
pnpm install
```

2. Copy the example environment file and edit it:

```powershell
copy .env.example .env
# then open .env in your editor and configure values (PORT, MONGODB_URI, JWT_SECRET, etc.)
```

3. Make sure MongoDB is running locally (or point `MONGODB_URI` to a running instance).

```powershell
# Start a local MongoDB server if you have it installed
mongod
```

4. Start the development server (hot-reloads on change):

```powershell
pnpm run dev
# or
pnpm run dev
```

Notes:
- The repo uses `ts-node-dev` for development (`pnpm run dev`).
- The provided `start` script currently runs the TypeScript source via `ts-node`.
  For a production-ready start, build to JavaScript and run the output with Node (see Production below).

## 🔧 pnpm Scripts

The `package.json` contains useful scripts you can run via `pnpm run <script>` or `pnpm run <script>`:

- `dev` - Start development server with hot reload (uses `ts-node-dev`).
- `build` - Compile TypeScript into JavaScript (outputs to `dist` if configured in `tsconfig.json`).
- `start` - Starts the server using `ts-node src/server.ts` (note: `ts-node` must be available).
- `dev:build` - Run `tsc --watch` for continuous builds.
- `clean` - Remove `dist` directory (`rimraf dist`).
- `typecheck` - Run the TypeScript compiler with `--noEmit` to type-check the code.
- `lint` / `lint:fix` - Run ESLint; `lint:fix` will attempt to fix issues.
- `format` / `format:check` - Run Prettier to format or check formatting.

If you plan to run in production, a recommended flow is:

```powershell
pnpm run build
node dist/server.js
```

(You may want to update the `start` script in `package.json` to `node dist/server.js` for production run.)

## � Development & Production

- Development: `pnpm run dev` (fast feedback with restarts)
- Production (recommended):
  1. `pnpm run build`
  2. `node dist/server.js` (or update `start` script to this command)

## 📝 API Endpoints (high level)

These are the endpoints the app aims to expose. Check each route file under `src/modules` for exact request/response details.

### Health Check

- GET /api/health — Server health/status

### Auth / User (examples)

- POST /api/auth/register — Register a new user
- POST /api/auth/login — Log in and receive a JWT
- GET /api/users/profile — Get authenticated user's profile
- PUT /api/users/profile — Update authenticated user's profile

### Chat

- GET /api/chat/rooms — List chat rooms
- POST /api/chat/rooms — Create a chat room
- GET /api/chat/rooms/:id/messages — Get messages for a room

## 🔌 Socket.IO Events

Client -> Server:
- `join_room` — Join a chat room
- `leave_room` — Leave a chat room
- `send_message` — Send a message to a room
- `typing_start` / `typing_stop` — Indicate typing status

Server -> Client:
- `message_received` — New message delivered
- `user_joined` / `user_left` — Presence updates
- `user_typing` / `user_stopped_typing` — Typing indicators

## 🛡️ Security & Validation

- Helmet for security headers
- CORS configured to allow the client origin
- Rate limiting to protect endpoints
- JWT-based authentication for protected routes
- Password hashing with bcryptjs
- Input validation using express-validator

## 📊 Logging

The application uses Pino for structured logs. Typical log levels: `debug`, `info`, `warn`, `error`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your change and add tests where appropriate
4. Run lint/format and ensure types pass: `pnpm run lint && pnpm run format && pnpm run typecheck`
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.
