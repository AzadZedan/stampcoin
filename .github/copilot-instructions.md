# Copilot Instructions for StampCoin Platform

## Project Overview

StampCoin is a full-stack web application for trading digital stamp NFTs/collectibles. It features a React frontend, an Express/tRPC backend, MySQL database via Drizzle ORM, Stripe payment integration, and AWS S3 image storage.

**Package Manager:** Always use `pnpm` (v10.4.1). Do **not** use `npm` or `yarn`.

---

## Repository Structure

```
/
├── client/              # React 19 frontend (Vite)
│   └── src/
│       ├── App.tsx          # Route definitions (Wouter router)
│       ├── main.tsx         # Entry point, tRPC/React Query setup
│       ├── pages/           # Page-level components
│       ├── components/      # Reusable UI components
│       │   └── ui/          # shadcn/ui primitives
│       ├── hooks/           # Custom React hooks
│       ├── _core/hooks/     # Core hooks (e.g., useAuth.ts)
│       ├── contexts/        # React context providers
│       ├── lib/trpc.ts      # tRPC client configuration
│       └── const.ts         # Frontend constants
├── server/              # Node.js/Express backend
│   ├── _core/
│   │   ├── index.ts         # Server entry point
│   │   ├── trpc.ts          # tRPC setup (publicProcedure, protectedProcedure)
│   │   ├── context.ts       # tRPC context (user, req, res)
│   │   ├── env.ts           # Environment variable access
│   │   ├── oauth.ts         # OAuth authentication
│   │   └── cookies.ts       # Cookie helpers
│   ├── routers.ts           # Main tRPC router (all endpoints)
│   ├── db.ts                # All database query functions
│   ├── storage.ts           # AWS S3 upload/download helpers
│   ├── stripe-webhook.ts    # Stripe webhook handler
│   ├── products.ts          # Stripe product/price definitions
│   └── *.test.ts            # Vitest test files
├── shared/              # Code shared by client and server
│   ├── types.ts             # Re-exported DB schema types
│   ├── const.ts             # Shared constants (e.g., COOKIE_NAME)
│   └── _core/errors.ts      # Shared error types
├── drizzle/             # Database schema and migrations
│   ├── schema.ts            # All table definitions
│   ├── relations.ts         # Drizzle table relationships
│   └── 0000-*.sql etc.      # Migration SQL files
└── .github/workflows/   # CI/CD workflows (see Known Issues below)
```

---

## Tech Stack

| Layer         | Technology                                         |
| ------------- | -------------------------------------------------- |
| Frontend      | React 19, Vite 7, Tailwind CSS 4, Wouter (routing) |
| UI Components | shadcn/ui (Radix UI primitives + Tailwind)         |
| State / Data  | TanStack React Query 5, React Hook Form 7          |
| API Layer     | tRPC 11 (type-safe RPC, no REST)                   |
| Backend       | Node.js, Express 4                                 |
| Database      | MySQL via Drizzle ORM 0.44.5                       |
| Auth          | OAuth + JWT (jose), cookie-based sessions          |
| Payments      | Stripe 20                                          |
| Storage       | AWS S3 (`@aws-sdk/client-s3`)                      |
| Validation    | Zod 4                                              |
| Testing       | Vitest 2                                           |
| Formatting    | Prettier 3                                         |

**TypeScript** is used throughout; strict mode is enabled.

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (hot reload, serves both API and frontend)
pnpm dev

# Type check (no emit)
pnpm check

# Format code with Prettier
pnpm format

# Run tests
pnpm test

# Build server (esbuild → dist/)
pnpm build

# Build frontend (Vite → dist/)
pnpm build:frontend

# Database: generate migrations and apply them
pnpm db:push
```

The dev server starts on port 3000. It serves the Express API at `/api/*` and proxies Vite for the frontend in development.

---

## Required Environment Variables

Set these before running the server (see `server/_core/env.ts`):

| Variable                 | Description                                                 |
| ------------------------ | ----------------------------------------------------------- |
| `DATABASE_URL`           | MySQL connection string (e.g., `mysql://user:pass@host/db`) |
| `JWT_SECRET`             | Secret for signing JWT tokens                               |
| `STRIPE_SECRET_KEY`      | Stripe API secret key (starts with `sk_`)                   |
| `VITE_APP_ID`            | Application ID (used by OAuth)                              |
| `OAUTH_SERVER_URL`       | OAuth server endpoint URL                                   |
| `OWNER_OPEN_ID`          | OpenID of the admin/owner user                              |
| `BUILT_IN_FORGE_API_URL` | Forge AI API endpoint                                       |
| `BUILT_IN_FORGE_API_KEY` | Forge AI API key                                            |
| `NODE_ENV`               | `development` or `production`                               |

AWS S3 credentials are needed for image uploads (use standard `AWS_*` env vars).

---

## API Architecture (tRPC)

All API endpoints are defined as tRPC procedures in `server/routers.ts`. The router is organized by domain:

- `auth.*` — login/logout, current user
- `stamps.*` — CRUD for stamps, filtering, search
- `categories.*` — stamp categories
- `favorites.*` — user favorites (protected)
- `reviews.*` — stamp reviews
- `transactions.*` — purchase records (protected)
- `payments.*` — Stripe checkout session creation
- `contact.*` — contact form
- `partners.*` — partner program
- `admin.*` — admin-only operations
- `system.*` — health check, system info

Use `publicProcedure` for unauthenticated endpoints and `protectedProcedure` (from `server/_core/trpc.ts`) for endpoints requiring a logged-in user. `protectedProcedure` throws `TRPCError({ code: "UNAUTHORIZED" })` if `ctx.user` is null.

On the frontend, call tRPC via the `trpc` client object from `client/src/lib/trpc.ts` with React Query hooks (`trpc.<router>.<procedure>.useQuery(...)`, `.useMutation(...)`, etc.).

---

## Database (Drizzle ORM + MySQL)

- Schema is defined in `drizzle/schema.ts` — modify tables here.
- Relationships are in `drizzle/relations.ts`.
- Database query functions live in `server/db.ts` — add new queries here.
- After changing the schema, run `pnpm db:push` to generate and apply migrations.
- Types are inferred from the schema: `typeof users.$inferSelect` / `typeof users.$inferInsert`.

**Key tables:** `users`, `stamps`, `categories`, `transactions`, `favorites`, `reviews`, `contacts`, `partners`, `partnerBenefits`, `partnerTransactions`.

Stamps and categories support multilingual content via separate columns per language: `title`, `titleAr`, `titleDe`, `titleFr`, `titleEs`, `titleZh`, `titleKo` (and the same pattern for descriptions). This is a flat column-per-language design — a known limitation that makes adding new languages require a schema migration. Follow this same pattern when adding multilingual fields to keep the codebase consistent.

Stamp rarity enum: `"common" | "uncommon" | "rare" | "very_rare" | "legendary"`.

---

## Authentication

- OAuth callback at `/api/oauth/callback` (handled by `server/_core/oauth.ts`).
- Sessions use signed cookies (`COOKIE_NAME` from `shared/const.ts`).
- `ctx.user` in tRPC context is populated from the session cookie.
- Frontend uses the `useAuth` hook from `client/src/_core/hooks/useAuth.ts`.
- A 401 response automatically redirects to the login page (see `client/src/main.tsx`).

---

## Testing

Tests use **Vitest** and are located alongside server code (`server/*.test.ts`).

```bash
pnpm test
```

Test files: `server/stamps.test.ts`, `server/payments.test.ts`, `server/auth.logout.test.ts`.

Tests use `appRouter.createCaller(ctx)` to call tRPC procedures directly (no HTTP). Mock context by constructing a `TrpcContext` object:

```typescript
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx: TrpcContext = {
  user: null, // or a User object for authenticated tests
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie: () => {} } as TrpcContext["res"],
};
const caller = appRouter.createCaller(ctx);
```

---

## Code Style

- **Formatter:** Prettier — run `pnpm format` before committing. Config in `.prettierrc`: double quotes, 2-space indent, trailing commas (ES5), semicolons.
- **TypeScript:** Strict mode. Avoid `any`; use proper types or Zod inference.
- **Imports:** Use path aliases (`@/*` → `client/src/*`, `@shared/*` → `shared/*`, `@assets/*` → `client/src/assets/*`).
- **UI Components:** Prefer existing shadcn/ui components from `client/src/components/ui/`. Add new shadcn components via `pnpm dlx shadcn@latest add <component>`.

---

## Frontend Routing

Routes are defined in `client/src/App.tsx` using [Wouter](https://github.com/molefrog/wouter):

| Path              | Component     |
| ----------------- | ------------- |
| `/`               | Home          |
| `/marketplace`    | Marketplace   |
| `/stamp/:id`      | StampDetail   |
| `/dashboard`      | Dashboard     |
| `/gallery`        | Gallery       |
| `/about`          | About         |
| `/investors`      | Investors     |
| `/contact`        | Contact       |
| `/partners`       | Partners      |
| `/payment-result` | PaymentResult |

---

## Known Issues and CI Notes

### Deno CI Workflow Failures

The repository has a `.github/workflows/deno.yml` workflow that runs `deno lint` and `deno test`. **This workflow is expected to fail** because this is a Node.js/pnpm project, not a Deno project. The Deno linter flags Node.js-specific patterns (`process`, `window`, `any` types, etc.) as errors.

**Do not attempt to fix these Deno lint errors** — they exist in the original codebase and are unrelated to the Node.js development workflow. The actual linting and testing is done via:

- `pnpm format` (Prettier)
- `pnpm check` (TypeScript)
- `pnpm test` (Vitest)

The Datadog Synthetic tests workflow (`datadog-synthetics.yml`) will also fail in CI unless the `DATADOG_API_KEY` and `DATADOG_APP_KEY` secrets are configured in the repository.

### No `.env.example` File

There is no `.env.example` file in the repository. Refer to the environment variables table above or to `server/_core/env.ts` for the full list of required variables.

---

## Deployment

Multiple deployment options are pre-configured:

- **Vercel:** `vercel.json` (frontend) and `vercel-backend.json` (backend API)
- **Fly.io:** `fly.toml`
- **Render:** `render.yaml`
- **Railway:** `railway.json`
- **Docker:** `Dockerfile`

See `DEPLOYMENT_INSTRUCTIONS.md` and `BACKEND_DEPLOYMENT_GUIDE.md` for detailed steps. Stripe setup is documented in `STRIPE_SETUP.md`.
