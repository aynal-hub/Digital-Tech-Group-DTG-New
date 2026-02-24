# Digital Tech Group Website

## Overview
A comprehensive recruitment, sourcing & digital marketing agency platform featuring a complete public website and full-featured admin panel. Founded by MD Aynal Hossain.

## Recent Changes
- 2026-02-24: Fixed Contact page settings query (was using old `settingKey`/`settingValue` format, updated to use `/api/settings` endpoint returning `Record<string, string>`)
- 2026-02-24: Fixed Free Sample page API endpoint (`/api/sample-requests` -> `/api/sample-request`)
- 2026-02-24: Fixed Payment Guidelines page `v.platform` -> `v.platformId` reference
- 2026-02-24: Complete project build with all pages and admin panel

## Project Architecture

### Stack
- **Frontend**: React + TypeScript, Vite, TailwindCSS, Shadcn UI, Framer Motion, Wouter (routing), TanStack Query v5
- **Backend**: Express.js, express-session with connect-pg-simple, bcryptjs
- **Database**: PostgreSQL (Neon-backed via Replit), Drizzle ORM
- **Validation**: Zod + drizzle-zod

### Structure
```
shared/schema.ts       - Database schema & types (12 tables)
server/storage.ts      - Storage interface & implementation (all CRUD ops)
server/routes.ts       - API routes (public + protected admin endpoints)
server/seed.ts         - Database seeding with initial data
server/db.ts           - Database connection
client/src/App.tsx     - Main router with all page routes
client/src/pages/      - All public & admin pages
client/src/components/ - Reusable components (admin-layout, public-navbar, seo-head, etc.)
```

### Database Tables
admins, services, packages, projects, blog_posts, testimonials, team_members, contact_messages, sample_requests, site_settings (key/value pairs), payment_platforms, payment_videos

### Key API Patterns
- Settings endpoint (`/api/settings`) returns `Record<string, string>` (flattened key-value object)
- Admin routes require session auth (`/api/admin/*`)
- Public routes: `/api/services`, `/api/packages`, `/api/projects`, `/api/blog`, `/api/team`, `/api/testimonials`, `/api/payment-platforms`, `/api/payment-videos`
- Form submissions: `POST /api/contact`, `POST /api/sample-request`

### Auth
- Default admin: admin@digitaltechgroup.com / admin123
- Session-based auth with bcryptjs password hashing
- Login: POST /api/admin/login, Logout: POST /api/admin/logout

## User Preferences
- Professional blue color theme (HSL 217)
- Dark mode support via class-based toggling
- Founder branding for MD Aynal Hossain throughout site
- Shadcn UI components with Framer Motion animations
