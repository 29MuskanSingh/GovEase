# GovEase AI — Admin Frontend & Backend Implementation Plan

Status: backend scaffold is scaffolded in `Admin_Backend/`, frontend scaffold is scaffolded in `Admin_Frontend/`. This file captures the phased plan, the agreed decisions, and the integration contract between the two services.

## Agreed Decisions (from scoping)

- Two new, isolated workspaces: `Admin_Backend/` (Node/Express + Mongoose) and `Admin_Frontend/` (React 19 + Vite). The existing `Backend_Node.js/` and `frontend/` are not modified for page structure.
- Shared database (same MongoDB Atlas database as citizen platform). Admin services read/write the same collections.
- Administrator identity: `USER` / `ADMIN` roles on the existing `users` collection. A one-time `npm run seed:admin` creates the first ADMIN.
- Authentication: dedicated `/api/admin/auth/login`. JWT access/refresh secrets reuse the existing `JWT_SECRET` / `JWT_REFRESH_SECRET` environment variables. Access tokens are `15m`, refreshes `7d`.
- Password handling: temporary-password reset with `passwordChangeRequired = true` and a forced change on next login (`POST /auth/change-password`).
- Security posture: plain-text password compatibility is preserved per explicit project choice; see Risks.
- All administrator mutations are recorded in an `audit_logs` collection.

## Admin Capabilities

- **Dashboard**: total / active / suspended users, profile-completion totals (threshold configurable), pending document counts and status distribution, active exams / opportunities / eligibility rules, recent users and recent audit entries.
- **Citizen management**: list, search, filter, view full profile (profile, address, identity, education, experience, skills, certifications, documents, preferences), activate/suspend, role assignment, password reset.
- **Content management (CRUD)**: eligibility rules, exams, opportunities — including JSON fields where the schema uses them.
- **Audit logs**: filter/search/pagination by actor, action, and resource.

## Phased Plan

### Phase 0 — Config & prerequisites
- `Admin_Backend/.env.example` and `Admin_Frontend/.env.example` with non-secret placeholder values.
- Verify shared DB connection string / JWT secrets are consistent with the citizen backend.
- Seed an initial ADMIN via `Admin_Backend#npm run seed:admin`.

### Phase 1 — Admin backend core (API)
- Models: `eligibilityRule`, `exam`, `opportunity`, `auditLog`, local `user` (adds `passwordChangeRequired`, `lastPasswordResetAt`).
- JWT service, auth + role middleware, audit service.
- Auth routes: `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`, `POST /auth/logout`, `POST /auth/change-password`.
- Admin routes: `/dashboard/metrics`, `/users`, `/users/:id`, `PATCH /users/:id`, `POST /users/:id/reset-password`, content CRUD, `/audit-logs`.
- Validation, rate limiting, CORS to `ADMIN_FRONTEND_URL`.

### Phase 2 — Admin frontend shell
- Vite app (port `5174` to avoid conflict with citizen `frontend` on `5173`), API client, `AuthContext`, protected/public route guards, layout/sidebar, login and forced password-change flows.

### Phase 3 — Dashboard + citizen management
- Dashboard metrics view, user list/search/filter/pagination, user detail view, activate/suspend, role assignment, reset-password flow.

### Phase 4 — Content management
- CRUD pages for eligibility rules, exams, opportunities with forms handling JSON fields and backend validation errors.

### Phase 5 — Audit & admin security
- Audit log viewer, last-admin-demotion guard, login/logout audit entries.

### Phase 6 — Integration verification
- Start `Admin_Backend` (port `3001`) and `Admin_Frontend` (port `5174`), log in as the seeded admin, navigate each section, run `npm run build` for both packages, and smoke-test the JSON API contract.

## API Contract (Admin frontend ↔ Admin backend)

Base path: `/api/admin` (served by `Admin_Backend` on port `3001`).

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/login` | public | returns `accessToken`, `refreshToken`, `user` |
| POST | `/auth/refresh` | public | returns new `accessToken` |
| GET | `/auth/me` | admin | current admin user |
| POST | `/auth/logout` | admin | audit logout |
| POST | `/auth/change-password` | admin | `currentPassword`, `newPassword` |
| GET | `/dashboard/metrics` | admin | dashboard numbers |
| GET | `/users?q=&role=&status=&page=&limit=` | admin | user list |
| GET | `/users/:id` | admin | user + all profile sections |
| PATCH | `/users/:id` | admin | `status`, `role`, `fullName`, `email` |
| POST | `/users/:id/reset-password` | admin | temporary password + forced change |
| GET | `/audit-logs` | admin | filter/pagination |
| GET | `/{eligibility-rules|exams|opportunities}?q=&page=&limit=` | admin | content list |
| GET | `/{eligibility-rules|exams|opportunities}/:id` | admin | content detail |
| POST | `/{eligibility-rules|exams|opportunities}` | admin | content create |
| PATCH | `/{eligibility-rules|exams|opportunities}/:id` | admin | content update |
| DELETE | `/{eligibility-rules|exams|opportunities}/:id` | admin | content delete |

Collection names mirror the citizen backend (`users`, `profiles`, `addresses`, `identities`, `education`, `experience`, `documents`, `user_preferences`, plus new `eligibility_rules`, `exams`, `opportunities`, `audit_logs`).

## Risks & Follow-ups

- Plain-text passwords remain; hashing should be added before production.
- `passwordChangeRequired` is honored by the Admin login flow; the citizen login does not yet enforce it (follow-up).
- Keep `0.0.0.0/0` out of Atlas production allowlist once IPv4/VPN access is confirmed.
