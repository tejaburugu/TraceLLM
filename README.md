# TraceLLM

TraceLLM is a lightweight chat assistant demo that combines a React/Vite frontend with an Express backend. It supports streaming LLM responses, request logging, and analytics over inference events.

## Setup

### Prerequisites

- Node.js 20+
- Docker / Docker Compose
- PostgreSQL (if not using Docker)

### Install dependencies

```bash
npm install
```

### Local development

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Start the backend and frontend separately:

```bash
npm run dev:api
npm run dev
```

### One-command Docker startup

```bash
cp .env.example .env
docker compose up
```

This spins up:

- `frontend` at `http://localhost:5173`
- `backend` at `http://localhost:4000`
- `postgres` on `5432`
- `redis` on `6379`

## Architecture Overview

The repository is split into two primary areas:

- `src/` — React frontend, chat UI, analytics dashboard, API client, and application state.
- `server/` — Express API, Prisma integration, providers, controllers, services, and middleware.

### Frontend

- Built with Vite + React + TypeScript.
- Uses Zustand for client state management.
- Provides chat UI, streaming messages, analytics charts, and theme support.
- Communicates with the backend through `/api` endpoints.

### Backend

- Built with Express and TypeScript.
- Uses Prisma for PostgreSQL ORM and schema management.
- Includes a provider registry that can route chat requests to OpenAI or a local provider.
- Logs inference events and exposes analytics endpoints.
- Uses environment-based configuration from `server/src/config/env.ts`.

## Schema Design

The Prisma schema defines four main models:

- `User`
  - Tracks user metadata and relations to conversations and inference logs.
- `Conversation`
  - Stores session-level conversation metadata and relations to messages/logs.
- `Message`
  - Stores chat history with role-based content ordering.
- `InferenceLog`
  - Captures provider, model, latency, token usage, errors, and preview data.

### Key design points

- `InferenceLog` is the central analytics model.
- Indices are added on session, conversation, user, provider, model, and status for query performance.
- Messages are stored with timestamp ordering via `createdAt` metadata.
- Relations support optional linking so logs can still be created even if conversation or user resolution is unavailable.

## Tradeoffs

- **In-memory conversation repository**: The current repository stores active conversations in memory for simplicity, which is fine for demos but not durable in production.
- **No authentication layer**: The app assumes a trusted environment and does not include user auth, making it ideal for prototypes but not secure for public deployment.
- **Server-side rendering**: The frontend is served as a separate Vite app rather than via the API server, which keeps concerns separated but adds a cross-origin proxy requirement in development.
- **Streaming support complexity**: Streaming improves UX but requires extra client-side parsing and error handling.

## Future Improvements

- Persist conversations and messages in the database.
- Add user authentication and authorization.
- Add request batching and rate-limit enforcement at the API layer.
- Support multiple deployment environments and secrets management.
- Add backend caching for repeated prompts or conversation state.
- Improve analytics with more data dimensions (usage by user, prompt templates, cost estimates).
- Add a production-ready reverse proxy and TLS termination.

## Logging Strategy

TraceLLM captures inference observations in `InferenceLog` records, including:

- provider and model
- request latency and status
- input/output preview
- token usage
- error metadata

Logging is designed for analytics and post-mortem inspection rather than full audit trails. The backend also includes request logging middleware for API traffic.

## Scaling Considerations

- Use PostgreSQL connection pooling and a managed DB service for production.
- Migrate the in-memory conversation store to a persistent cache or DB.
- Offload analytics aggregation to a scheduled job or OLAP store if query volume grows.
- Add Redis-based rate limiting and session state storage.
- Separate frontend and API deployment into distinct containers with proper service discovery.

## Failure Assumptions

- The backend assumes the database is available and reachable via `DATABASE_URL`.
- Streaming and provider responses may fail if OpenAI credentials are invalid or if provider latency spikes.
- The application assumes only a single API host; cross-origin issues may appear if `CORS_ORIGIN` is not configured correctly.
- Without authentication, the app assumes trusted access and does not defend against malicious clients.

## Deployment

### Docker Compose

Use the included `docker-compose.yml` for local or staging deployment.

```bash
cp .env.example .env
docker compose up
```

### Production notes

- Build the backend and serve it behind a reverse proxy.
- Use a managed PostgreSQL and Redis service.
- Store secrets securely and do not commit `.env` values.
- Run `npm run prisma:migrate:dev` or migrate the Prisma schema before starting the backend.

## Useful Commands

```bash
npm install
npm run dev
npm run dev:api
npm run build
npm run build:api
npm run prisma:generate
npm run prisma:migrate:dev
```

---

TraceLLM is intended as a prototype for LLM-driven chat with logs and analytics. The current design is optimized for developer iteration and observability rather than production-grade security or scale.