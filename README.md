# NodeVault

NodeVault is a secure, scalable REST API system for managing user credentials, encrypted notes, and access keys. It implements stateless JWT authentication, role-based access control (RBAC), a layered TypeScript backend, and a React dashboard frontend.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [Request Lifecycle](#request-lifecycle)
- [API Reference](#api-reference)
- [Role-Based Access Control](#role-based-access-control)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Test Accounts](#test-accounts)
- [Scalability Design](#scalability-design)

---

## Architecture Overview

NodeVault is organized as a decoupled full-stack monorepo. The backend is a strictly-typed Express.js server structured in layers. The frontend is a React single-page application that communicates exclusively through the REST API.

```mermaid
graph TD
    Browser["Browser / Client"] --> Frontend["Frontend\nReact + Vite\nlocalhost:5173"]
    Frontend --> API["Backend REST API\nExpress + TypeScript\nlocalhost:5001"]
    API --> Middleware["Middleware Layer\nAuth / Validation / Error Handler"]
    Middleware --> Controllers["Controllers"]
    Controllers --> Services["Services\nBusiness Logic"]
    Services --> Repositories["Repositories\nPrisma ORM"]
    Repositories --> DB["SQLite Database\nprisma/dev.db"]
    API --> SwaggerUI["Swagger UI\n/api-docs"]
```

---

## Project Structure

```
nodevault/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema and model definitions
│   │   ├── seed.ts                # Database seed script
│   │   └── migrations/            # Auto-generated Prisma migration history
│   ├── src/
│   │   ├── index.ts               # Express app entry point, middleware wiring
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts # Handles auth route requests/responses
│   │   │   └── secret.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts    # Registration, login, profile logic
│   │   │   └── secret.service.ts  # CRUD logic with ownership enforcement
│   │   ├── repositories/
│   │   │   ├── user.repository.ts # Prisma User model queries
│   │   │   └── secret.repository.ts
│   │   ├── middlewares/
│   │   │   ├── auth.ts            # JWT bearer token verification
│   │   │   ├── validate.ts        # Zod schema validation middleware
│   │   │   └── errorHandler.ts    # Global error catch and response formatter
│   │   ├── schemas/
│   │   │   ├── auth.schema.ts     # Zod schemas: register, login
│   │   │   └── secret.schema.ts   # Zod schemas: create, update, get
│   │   ├── routes/
│   │   │   ├── index.ts           # Versioned API router (/api/v1)
│   │   │   ├── auth.routes.ts     # Auth endpoint definitions
│   │   │   └── secret.routes.ts   # Secrets endpoint definitions
│   │   └── utils/
│   │       ├── logger.ts          # Winston structured logger
│   │       ├── jwt.ts             # Token sign and verify helpers
│   │       ├── hash.ts            # bcryptjs password hash and compare
│   │       └── db.ts              # Prisma singleton client
│   ├── .env                       # Environment variables
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx                # All UI components and routing logic
    │   ├── index.css              # Design system, light/dark theme variables
    │   ├── main.jsx               # React DOM root mount
    │   └── context/
    │       └── AuthContext.jsx    # Auth state, JWT storage, API fetch wrapper
    ├── index.html
    └── package.json
```

---

## Technology Stack

### Backend

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| Runtime | Node.js v18+ | JavaScript server runtime |
| Language | TypeScript (strict) | Type safety and compile-time validation |
| Framework | Express.js | HTTP routing and middleware |
| ORM | Prisma | Type-safe database client and migrations |
| Database | SQLite | Embedded relational database (swappable to PostgreSQL) |
| Auth | jsonwebtoken | Stateless JWT signing and verification |
| Hashing | bcryptjs | Secure password hashing with salt rounds |
| Validation | Zod | Runtime schema validation for all request payloads |
| Logging | Winston + Morgan | Structured application and HTTP request logging |
| API Docs | swagger-jsdoc + swagger-ui-express | Auto-generated interactive documentation |

### Frontend

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| Framework | React 18 | Component-based UI rendering |
| Build Tool | Vite | Fast dev server and production bundler |
| Styling | Vanilla CSS | Custom design system with CSS variables |
| State | React Context API | Global auth and token management |
| HTTP | Native Fetch API | REST API communication with bearer auth |

---

## Database Schema

NodeVault uses two relational tables. A `User` has many `Secrets`. Deleting a user cascades deletion to all their secrets.

```mermaid
erDiagram
    USER {
        String id PK "UUID"
        String email "Unique, indexed"
        String password "bcrypt hash"
        String role "USER or ADMIN"
        DateTime createdAt
        DateTime updatedAt
    }

    SECRET {
        String id PK "UUID"
        String title
        String type "PASSWORD, NOTE, KEY, OTHER"
        String content
        String userId FK
        DateTime createdAt
        DateTime updatedAt
    }

    USER ||--o{ SECRET : "owns"
```

---

## Authentication Flow

All protected routes require a `Bearer` JWT in the `Authorization` header. Tokens are signed with `HS256` and expire after 24 hours.

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant AuthMiddleware
    participant Service
    participant Database

    Client->>API: POST /api/v1/auth/login
    Note over Client,API: Body: { email, password }
    API->>Service: AuthService.login()
    Service->>Database: Find user by email
    Database-->>Service: User record
    Service->>Service: bcrypt.compare(password, hash)
    alt Invalid credentials
        Service-->>API: throw AppError(401)
        API-->>Client: 401 Invalid email or password
    else Valid credentials
        Service->>Service: jwt.sign({ userId, email, role })
        Service-->>API: { user, token }
        API-->>Client: 200 OK + JWT token
    end

    Client->>API: GET /api/v1/secrets
    Note over Client,API: Header: Authorization: Bearer <token>
    API->>AuthMiddleware: Extract and verify token
    alt Token missing or invalid
        AuthMiddleware-->>Client: 401 Unauthorized
    else Token valid
        AuthMiddleware->>API: req.user = { userId, email, role }
        API->>Service: SecretService.getSecrets(req.user)
        Service->>Database: Query secrets by userId or all (ADMIN)
        Database-->>Service: Secret records
        Service-->>API: Secret[]
        API-->>Client: 200 OK + data
    end
```

---

## Request Lifecycle

Every inbound request passes through a fixed middleware pipeline before reaching business logic.

```mermaid
flowchart LR
    Request["Incoming HTTP Request"] --> CORS["CORS Middleware"]
    CORS --> BodyParser["express.json()"]
    BodyParser --> Morgan["Morgan Logger"]
    Morgan --> Router["API Router\n/api/v1"]
    Router --> AuthMW["auth Middleware\nJWT Verification"]
    AuthMW --> ValidateMW["validate Middleware\nZod Schema Check"]
    ValidateMW --> Controller["Controller\nreq / res handling"]
    Controller --> Service["Service\nBusiness Logic"]
    Service --> Repository["Repository\nPrisma ORM"]
    Repository --> DB[("SQLite")]
    DB --> Repository
    Repository --> Service
    Service --> Controller
    Controller --> Response["HTTP Response"]

    ValidateMW -- "Invalid payload" --> ErrorHandler["Global Error Handler"]
    AuthMW -- "Invalid token" --> ErrorHandler
    Service -- "AppError thrown" --> ErrorHandler
    ErrorHandler --> Response
```

---

## API Reference

Base URL: `http://localhost:5001/api/v1`

Interactive documentation with live request execution is available at `http://localhost:5001/api-docs`.

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | No | Register a new user account |
| POST | `/auth/login` | No | Authenticate and receive a JWT token |
| GET | `/auth/profile` | Yes | Retrieve the authenticated user's profile |

### Secrets Endpoints

| Method | Endpoint | Auth Required | Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/secrets` | Yes | USER | Create a new vault item |
| GET | `/secrets` | Yes | USER, ADMIN | List secrets (own for USER, all for ADMIN) |
| GET | `/secrets/:id` | Yes | USER (owner), ADMIN | Retrieve a specific vault item |
| PUT | `/secrets/:id` | Yes | USER (owner only) | Update a vault item |
| DELETE | `/secrets/:id` | Yes | USER (owner), ADMIN | Delete a vault item |

### Standard Response Shape

All responses follow a consistent JSON envelope:

```json
{
  "success": true,
  "message": "Optional descriptive message",
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE_CONSTANT"
}
```

Validation failure responses include field-level details:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

---

## Role-Based Access Control

```mermaid
flowchart TD
    Request["Authenticated Request"] --> CheckRole{"User Role?"}

    CheckRole -- "ADMIN" --> AdminAccess["Full Read Access\nAll secrets in system\nDelete any secret\nNo create or edit"]

    CheckRole -- "USER" --> CheckOwnership{"Operation?"}
    CheckOwnership -- "GET /secrets" --> OwnSecrets["Returns own secrets only"]
    CheckOwnership -- "POST /secrets" --> CreateOwn["Create secret under own userId"]
    CheckOwnership -- "PUT /secrets/:id" --> OwnerCheck1{"Is owner?"}
    CheckOwnership -- "DELETE /secrets/:id" --> OwnerCheck2{"Is owner?"}

    OwnerCheck1 -- "Yes" --> AllowUpdate["Allow update"]
    OwnerCheck1 -- "No" --> Deny403["403 Forbidden"]
    OwnerCheck2 -- "Yes" --> AllowDelete["Allow delete"]
    OwnerCheck2 -- "No" --> Deny403
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Run database migrations (creates prisma/dev.db)
npx prisma migrate dev --name init

# Seed the database with test accounts and sample data
npx ts-node prisma/seed.ts

# Start the development server with hot reload
npm run dev
```

The API server starts at `http://localhost:5001`.
Swagger documentation is available at `http://localhost:5001/api-docs`.

### Frontend Setup

Open a separate terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The dashboard is available at `http://localhost:5173`.

### Production Build

```bash
# Backend
cd backend && npm run build
node dist/index.js

# Frontend
cd frontend && npm run build
# Serve the dist/ folder with any static file server
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `5001` | Port the Express server listens on |
| `DATABASE_URL` | `file:./dev.db` | Prisma database connection string |
| `JWT_SECRET` | — | Secret key used to sign JWT tokens. Must be changed in production |
| `NODE_ENV` | `development` | Application environment (`development` or `production`) |

To switch to PostgreSQL, change `DATABASE_URL` to a PostgreSQL connection string and update `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run:

```bash
npx prisma migrate dev --name switch-to-postgres
```

---

## Test Accounts

The seed script creates the following accounts for local development and evaluation:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| ADMIN | `admin@nodevault.com` | `admin123` | Read and delete all secrets system-wide |
| USER | `user@nodevault.com` | `user123` | Full CRUD on own secrets only |

---

## Scalability Design

```mermaid
graph TD
    subgraph "Current Architecture"
        Client1["Client"] --> LB1["Express Server\nSQLite"]
    end

    subgraph "Production Architecture"
        Clients["Clients"] --> LoadBalancer["Load Balancer\nNGINX / AWS ALB"]
        LoadBalancer --> Instance1["Express Instance 1\nDocker Container"]
        LoadBalancer --> Instance2["Express Instance 2\nDocker Container"]
        LoadBalancer --> Instance3["Express Instance N\nDocker Container"]

        Instance1 --> Redis["Redis Cache\nSession / Profile Data"]
        Instance2 --> Redis
        Instance3 --> Redis

        Instance1 --> PGPrimary["PostgreSQL Primary\nWrite Operations"]
        Instance2 --> PGPrimary
        Instance3 --> PGPrimary

        PGPrimary --> PGReplica1["PostgreSQL Read Replica 1"]
        PGPrimary --> PGReplica2["PostgreSQL Read Replica 2"]

        Instance1 --> KMS["AWS KMS / HashiCorp Vault\nSecret Content Encryption"]
    end
```

### Scaling Recommendations

**Database**
Migrate from SQLite to a managed PostgreSQL cluster (Now implemented using Supabase). Use connection pooling (PgBouncer) for serverless environments to handle high concurrency, and implement read replicas to offload read-heavy traffic.

**Caching**
Introduce a Redis layer for caching frequently accessed secrets or user profiles. Implement a Cache-Aside pattern where results are served from Redis, reducing the load on the primary PostgreSQL database and improving response times (TTFB).

**Horizontal Scaling & Failover**
Since the JWT authentication is stateless, Express server instances can be scaled horizontally across multiple Availability Zones (AZs) behind a Load Balancer (ALB). Deploying as Docker containers managed by Kubernetes (EKS) or ECS allows for automatic health checks and self-healing.

**Security & Encryption at Rest**
Implemented password hashing with bcryptjs (10 rounds) and JWT for stateless auth. For enterprise scaling, implement envelope encryption for secret content using AWS KMS or HashiCorp Vault. This ensures that even in the case of a database breach, individual secrets remain encrypted with unique keys.

**Microservice Migration**
The current layered architecture (Controller -> Service -> Repository) is designed for a clean migration to microservices. The Auth module can be extracted into an independent Identity Provider (IdP), while the Secret module can scale independently to handle heavy CRUD operations.

**Enterprise Logging & Monitoring**
Integrated Winston structured logging for production auditing. For scaling, logs should be aggregated into an ELK stack (Elasticsearch, Logstash, Kibana) or Datadog for real-time alerting on API failures and performance bottlenecks.
