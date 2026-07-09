# Drowven API

REST API built with **Node.js**, **TypeScript**, **Express** and **PostgreSQL** (no ORM).

## Tech Stack

| Layer       | Technology             |
|-------------|------------------------|
| Runtime     | Node.js 22             |
| Language    | TypeScript 5           |
| Framework   | Express 4              |
| Database    | PostgreSQL 17 (`pg`)   |
| Container   | Docker + Compose       |

## Getting Started

### Prerequisites

- Docker & Docker Compose

### 1. Configure environment

```bash
cp .env.example .env
# Edit .env if you want to change defaults
```

### 2. Run in development (hot-reload, source mounted)

```bash
docker compose --profile dev up api-dev db
```

### 3. Run in production

```bash
docker compose up --build
```

### 4. Stop & clean up

```bash
docker compose down
# Remove volumes too:
docker compose down -v
```

## Project Structure

```
api/
├── src/
│   ├── config/         # Environment / configuration
│   ├── database/       # pg pool, raw SQL helpers, migrations
│   ├── middlewares/    # errorHandler, notFound
│   ├── models/         # TypeScript interfaces / DTOs
│   ├── controllers/    # HTTP request handlers
│   ├── services/       # Business logic
│   ├── routes/         # Express routers
│   ├── utils/          # Response helpers
│   ├── types/          # Express type extensions
│   ├── app.ts          # App factory
│   └── index.ts        # Entrypoint + graceful shutdown
├── Dockerfile
├── docker-compose.yml
├── tsconfig.json
└── package.json
```

## API Endpoints

| Method | Path               | Description          |
|--------|--------------------|----------------------|
| GET    | /health            | Health check         |
| GET    | /api/v1/users      | List all users       |
| GET    | /api/v1/users/:id  | Get user by ID       |
| POST   | /api/v1/users      | Create user          |
| PATCH  | /api/v1/users/:id  | Update user          |
| DELETE | /api/v1/users/:id  | Delete user          |

## Database Migrations

Migrations run **automatically** on startup via `src/database/migrate.ts`.  
Each migration is tracked in the `schema_migrations` table and only applied once.  
Add new migrations by appending SQL strings to the `migrations` array.

## Testing

Integration tests use **Jest** + **Supertest** against a real PostgreSQL instance (`drowven_test` database).

### Option A — Docker (recommended, zero local setup)

```bash
npm run test:docker
# or directly:
docker compose -f docker-compose.test.yml up --abort-on-container-exit
```

The test DB runs as an **ephemeral tmpfs container** (no persistent volume), so it's always clean.

### Option B — Local PostgreSQL

Ensure a local PostgreSQL server is running with the `drowven_user` role, then:

```bash
# The test suite auto-creates the "drowven_test" DB if it doesn't exist
npm test
```

Override defaults via environment variables:

```bash
TEST_DB_HOST=localhost TEST_DB_PORT=5432 \
TEST_DB_NAME=drowven_test TEST_DB_USER=drowven_user \
TEST_DB_PASSWORD=drowven_password npm test
```

### Other test commands

| Command                | Description                          |
|------------------------|--------------------------------------|
| `npm test`             | Run all tests once                   |
| `npm run test:watch`   | Re-run on file changes (TDD mode)    |
| `npm run test:coverage`| Run tests + generate coverage report |
| `npm run test:docker`  | Full Docker-isolated run             |

### Test structure

```
tests/
├── helpers/
│   ├── app.ts       # Supertest agent (wraps createApp())
│   └── db.ts        # setupTestDatabase / clearTables / teardownTestDatabase
└── integration/
    ├── health.test.ts   # GET /health, 404 handler
    └── users.test.ts    # Full CRUD for /api/v1/users
```
