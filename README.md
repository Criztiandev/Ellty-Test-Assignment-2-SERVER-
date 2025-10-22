# Express TypeScript Server

A Node.js Express server built with TypeScript, featuring authentication with JWT and bcrypt, and SQLite database.

## Features

- TypeScript
- Express.js
- SQLite database
- JWT authentication
- Bcrypt password hashing
- CORS enabled
- Environment variables with dotenv

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production
```

## Development

Run the server in development mode with hot reload:

```bash
npm run dev
```

## Build

Build the TypeScript code:

```bash
npm run build
```

## Production

Start the server in production mode:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.ts       # SQLite database configuration
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication middleware
│   ├── routes/
│   │   └── auth.ts           # Authentication routes
│   └── index.ts              # Main server file
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment variables example
├── .gitignore
├── nodemon.json              # Nodemon configuration
├── package.json
├── tsconfig.json             # TypeScript configuration
└── README.md
```

## Database

The application uses SQLite with the following schema:

### Users Table
- `id` - INTEGER PRIMARY KEY AUTOINCREMENT
- `email` - TEXT UNIQUE NOT NULL
- `password` - TEXT NOT NULL (hashed with bcrypt)
- `created_at` - DATETIME DEFAULT CURRENT_TIMESTAMP
