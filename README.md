# SaaS Backend PoC (Multi-tenant Node.js + MySQL)

A robust Proof-of-Concept backend demonstrating a corporate-level multi-tenant SaaS architecture using Node.js, Express, and MySQL (Single DB, Shared Schema).

## Tech Stack

- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Database**: MySQL (using Knex.js for migrations/queries)
- **Auth**: JWT-based (stateless) with Tenant Isolation Middleware

## Prerequisites

- Node.js (v18+)
- MySQL Server (running locally or remote)

## Installation

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Environment**
   Ideally cp .env.example .env and update DB credentials

   ```bash
   cp .env.example .env
   # Edit .env and set DB_USER, DB_PASSWORD, DB_NAME (ensure DB exists)
   ```

3. **Database Setup**
   Ensure your MySQL server is running and the database (e.g., `saas_poc`) exists.

   ```sql
   CREATE DATABASE saas_poc;
   ```

4. **Run Migrations**

   ```bash
   # Install knex globally if needed or use npx
   npx knex migrate:latest
   ```

5. **Start Server**
   ```bash
   npm run dev
   ```

## API Testing (Curl Commands)

### 1. Tenant Enrollment (Signup)

Create a new tenant (Company A) and admin user.

```bash
curl -X POST http://localhost:3000/api/auth/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Acme Corp",
    "adminName": "Alice Admin",
    "adminEmail": "alice@acme.com",
    "adminPassword": "password123"
  }'
```

_Response will include a `token`. Save this._

### 2. Login (as Admin)

Get a JWT token.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@acme.com",
    "password": "password123"
  }'
```

### 3. Get Tenant Details

Verify context isolation.

```bash
curl http://localhost:3000/api/tenants/me \
  -H "Authorization: Bearer <TOKEN>"
```

### 4. Create a Project

Create a project for Acme Corp.

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign",
    "description": "Q1 Initiative"
  }'
```

_Note the `id` of the created project._

### 5. Create a Task in Project

```bash
curl -X POST http://localhost:3000/api/projects/<PROJECT_ID>/tasks \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design Mockups",
    "status": "IN_PROGRESS"
  }'
```

### 6. Verify Isolation (Multi-tenancy Test)

1. Enroll a **second tenant** (Beta Inc).
2. Login as Beta Inc admin.
3. Try to access Acme Corp's projects (using Beta Inc's token but accessing Acme's endpoints/IDs if possible, or just list projects).
   ```bash
   curl http://localhost:3000/api/projects \
     -H "Authorization: Bearer <BETA_TOKEN>"
   ```
   _Should return empty array or only Beta Inc's projects._

## Architecture Notes

- **Tenancy Model**: Single Database, Shared Schema. Every table has a `tenant_id`.
- **Isolation**: Middleware (`requireTenant`) ensures every request is scoped. All DB queries MUST include `.where({ tenant_id })`.
- **Production Mapping**:
  - **Database**: Swap `mysql2` for `pg` driver to use AWS Aurora Postgres.
  - **Migrations**: Knex migrations are largely portable.
  - **Scaling**: Node.js instances are stateless; scale horizontally behind a load balancer.
  - **Security**: For Postgres, implement **Row Level Security (RLS)** as a defense-in-depth measure.
