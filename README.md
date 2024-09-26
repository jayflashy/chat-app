# Chat App Backend

A real-time chat application backend built with Node.js, Express, TypeScript, MongoDB, and Socket.IO.

## 🚀 Features

- **Real-time messaging** with Socket.IO
- **User authentication** with JWT
- **MongoDB database** with Mongoose
- **TypeScript** for type safety
- **Structured logging** with Pino
- **File uploads** with Multer
- **Rate limiting** and security middleware
- **Modular architecture** for scalability

## 📁 Project Structure

```
├── src/
│   ├── config/           # Database and app configuration
│   ├── middleware/       # Custom middleware (auth, error handling)
│   ├── modules/          # Feature modules (user, chat, message)
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

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **File Uploads**: Multer
- **Logging**: Pino
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: express-validator

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/chat-app
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # Logging
   LOG_LEVEL=info
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

## 🚀 Development

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Clean build directory

## 🔧 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### User Routes (Coming Soon)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Chat Routes (Coming Soon)
- `GET /api/chat/rooms` - Get chat rooms
- `POST /api/chat/rooms` - Create chat room
- `GET /api/chat/rooms/:id/messages` - Get room messages

## 🔌 Socket.IO Events

### Client to Server
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing_start` - User started typing
- `typing_stop` - User stopped typing

### Server to Client
- `message_received` - New message received
- `user_joined` - User joined room
- `user_left` - User left room
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing

## 🛡️ Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent abuse
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt
- **Input Validation** - express-validator
- **File Upload Security** - File type and size limits

## 📊 Logging

The application uses **Pino** for structured logging:

- **Request logging** - HTTP requests with timing
- **Error logging** - Detailed error information
- **Application logging** - Server startup and events

Log levels: `debug`, `info`, `warn`, `error`

## 🗄️ Database Schema

### User Model
```typescript
{
  username: string (unique, required)
  email: string (unique, required)
  password: string (hashed, required)
  avatar?: string
  isOnline: boolean
  lastSeen: Date
  createdAt: Date
  updatedAt: Date
}
```

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   ```

3. **Start the server**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Happy Coding! 🎉**
