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
- ESLint & Prettier for code quality
- Husky & lint-staged for pre-commit hooks
- Docker & Docker Compose support
- GitHub Actions CI/CD
- Render deployment configuration

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

### Local Development

Run the server in development mode with hot reload:

```bash
npm run dev
```

### Docker Development

Run with Docker Compose:

```bash
# Development mode with hot reload
npm run docker:dev

# Rebuild and start
npm run docker:dev:build
```

## Build

Build the TypeScript code:

```bash
npm run build
```

## Production

### Local Production

Start the server in production mode:

```bash
npm start
```

### Docker Production

```bash
# Build the production image
npm run docker:build

# Start the container
npm run docker:up

# Stop the container
npm run docker:down

# Or use docker-compose directly
docker-compose up -d
```

## Code Quality

### Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

### Formatting

```bash
# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

### Pre-commit Hooks

Husky is configured to run lint-staged on every commit, which will automatically lint and format your code.

## Deployment

### Render

This project is configured for deployment on Render using `render.yaml`.

1. Push your code to GitHub
2. Connect your repository to Render
3. Render will automatically use the `render.yaml` configuration
4. Set any additional environment variables in the Render dashboard

### CI/CD

GitHub Actions will automatically:
- Run linting on every push/PR
- Check code formatting
- Build the TypeScript code
- Run tests (if configured)

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
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI workflow
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment variables example
├── .gitignore
├── .dockerignore
├── Dockerfile                # Production Docker image
├── Dockerfile.dev            # Development Docker image
├── docker-compose.yml        # Docker Compose for production
├── docker-compose.dev.yml    # Docker Compose for development
├── nodemon.json              # Nodemon configuration
├── package.json
├── tsconfig.json             # TypeScript configuration
├── render.yaml               # Render deployment config
└── README.md
```

## Database

The application uses SQLite with the following schema:

### Users Table
- `id` - INTEGER PRIMARY KEY AUTOINCREMENT
- `email` - TEXT UNIQUE NOT NULL
- `password` - TEXT NOT NULL (hashed with bcrypt)
- `created_at` - DATETIME DEFAULT CURRENT_TIMESTAMP
# Ellty-Test-Assignment-2-SERVER-
