# AI/Developer Context - Cookbook Remix Migration

## TL;DR
- **Project**: Migrating from Next.js + Express (2 separate containers) to Remix (1 unified container)
- **Branch**: Feature branch `main` (WIP)
- **Status**: Phase 1 complete ✅, Phases 2-12 pending
- **Current Goal**: Continue with Phase 2 (database setup)

---

## What This Project Does

**Cookbook** is a recipe management application where users can:
- Create, read, update, delete recipes
- Organize recipes into groups/categories
- Upload recipe images
- Search recipes by name
- Import recipes from websites/URLs
- Print recipes
- Scale recipe ingredients

---

## Current Architecture (What's Being Changed)

### OLD ARCHITECTURE (3 Docker containers + Nginx)
```
User → Nginx (reverse proxy)
         ├→ Next.js Frontend (UI) [Port 3000]
         ├→ Express API (backend) [Port 3000]
         └→ PostgreSQL DB [Port 5432]
```

**Problems with this**:
- Maintain 3 Dockerfiles
- Run 2 dev servers separately (`npm run dev` in api/ AND frontend/)
- CORS configuration needed
- Type sync issues between API and frontend
- More complex deployment

### NEW ARCHITECTURE (1 Docker container)
```
User → Remix App (full-stack) [Port 3000]
         └→ PostgreSQL DB [Port 5432]
```

**Benefits**:
- Single `npm run dev` command
- 1 Dockerfile to maintain
- No CORS issues (same-origin by default)
- Type-safe end-to-end (Remix loaders return types that flow to components)
- Simpler deployment

---

## Folder Layout (IMPORTANT!)

```
cookbook/
├── app/                     ← ✨ NEW REMIX APP (WORK HERE)
│   ├── routes/             ← Pages and API endpoints
│   ├── components/         ← React components
│   ├── lib/
│   │   ├── db.ts          ← Drizzle ORM connection
│   │   ├── db.schema.ts   ← Table definitions
│   │   └── queries/       ← Database query functions
│   ├── types/index.ts     ← TypeScript interfaces
│   ├── root.tsx           ← Root layout
│   ├── root.css           ← Global styles
│   └── entry.server.tsx   ← Server entry
│
├── api/                     ← 🗂️ OLD EXPRESS API (REFERENCE ONLY)
│   ├── src/
│   │   ├── data/cookbookdb.ts      ← Copy DB queries from here
│   │   ├── routes/                 ← Copy route logic from here
│   │   ├── controllers/            ← Copy business logic from here
│   │   └── types/index.ts          ← Already copied to app/types/
│   └── init.sql                    ← Database schema (REFERENCE)
│
├── frontend/                ← 🗂️ OLD NEXT.JS UI (REFERENCE ONLY)
│   ├── src/
│   │   ├── components/     ← Copy components from here
│   │   ├── app/            ← Copy page layouts from here
│   │   ├── lib/api.ts      ← Reference for data fetching logic
│   │   └── types/          ← Already copied to app/types/
│   └── public/             ← Static assets (copy if needed)
│
├── package.json            ← ✅ UNIFIED DEPENDENCIES
├── tsconfig.json           ← ✅ NOW POINTS TO app/** ONLY
├── vite.config.ts          ← ✅ BUILD CONFIG
├── remix.config.js         ← ✅ REMIX CONFIG
├── Dockerfile              ← ✅ SINGLE CONTAINER
├── docker-compose.yml      ← ✅ SIMPLIFIED (app + db only)
│
├── MIGRATION_GUIDE.md      ← 📖 DETAILED PHASE-BY-PHASE GUIDE
├── QUICK_START.md          ← 📖 QUICK REFERENCE
├── REMIX_MIGRATION_SCAFFOLD.md ← 📖 PROJECT STRUCTURE OVERVIEW
└── AI_CONTEXT.md           ← 📖 THIS FILE

```

### Golden Rule
- **Only modify files in `app/` folder**
- Use `api/` and `frontend/` as reference ONLY
- At the very end (Phase 12), delete `api/` and `frontend/`

---

## Technology Stack

### What Didn't Change
- **Database**: PostgreSQL (same)
- **Styling**: Tailwind CSS (same)
- **Icons**: lucide-react (same)
- **Date handling**: date-fns (same)
- **Utilities**: uuid, slugify (same)

### What Changed
- **Framework**: Next.js + Express → **Remix**
- **ORM**: Raw pg queries → **Drizzle ORM**
- **Build tool**: Webpack → **Vite**
- **Containers**: 3 → **1**

### Key Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| `@remix-run/node` | 2.10.0 | Remix runtime |
| `@remix-run/react` | 2.10.0 | Remix React integration |
| `drizzle-orm` | 0.38.0 | Type-safe ORM for PostgreSQL |
| `pg` | 8.16.3 | PostgreSQL driver |
| `tailwindcss` | 3.4.0 | Styling |
| `react` | 18.3.0 | UI framework |
| `express` | 4.20.0 | HTTP server (required by Remix) |

---

## Phase Breakdown

### ✅ Phase 1: Project Setup (COMPLETE)
- Created Remix scaffold
- Installed dependencies (919 packages)
- Created Drizzle schema
- Configured TypeScript, Tailwind, ESLint
- Single Dockerfile created
- Verified: build works, dev server starts

### ⏳ Phase 2: Database (2-3 days)
- Verify database schema
- Create query functions using Drizzle
- Set up migrations
- Test database connectivity

### ⏳ Phases 3-7: Core Features (5-7 days)
- Migrate styles & assets
- Create recipe routes (CRUD)
- Create group routes (CRUD)
- Implement image upload
- Implement recipe scraper/import

### ⏳ Phases 8-9: UI Components (4-5 days)
- Copy React components from `frontend/`
- Convert Next.js pages to Remix routes
- Remove all `fetch()` calls
- Replace with loader/action patterns

### ⏳ Phase 10: Testing (2-3 days)
- QA all features
- Check for console errors
- Verify database interactions

### ⏳ Phase 11: Deployment (1-2 days)
- Build Docker image
- Test container
- Verify all services work

### ⏳ Phase 12: Cleanup (1 day)
- Delete `api/` and `frontend/` folders
- Update documentation
- Final commit & tag

**Total Remaining**: ~20-25 days of focused work

---

## Key Concept: Remix Data Flow

### The Old Way (Next.js + Express)
```
Browser               Next.js Frontend      Express API      PostgreSQL
  │                       │                     │                │
  │─ request page ───────>│                     │                │
  │                       │─ fetch data ──────>│                │
  │                       │                     │─ SQL query ───>│
  │                       │                     │<────── data ───│
  │                       │<── JSON response ──│                │
  │<─ HTML + JSON ────────│                     │                │
  │
  │─ browser renders page and fetches data again─────────────>│
```

### The New Way (Remix)
```
Browser               Remix Server          PostgreSQL
  │                       │                     │
  │─ request page ───────>│                     │
  │                       │─ call loader ──────>│
  │                       │ (fetch from DB)     │
  │                       │<── SQL data ────────│
  │                       │                     │
  │<─ HTML (pre-rendered with data) ─────────│
  │
  │─ browser renders page (data already there)
```

**Key differences**:
1. **No `useEffect` needed** - Data loads before component renders
2. **No client-side fetch calls** - All data loaded server-side
3. **Faster initial page load** - HTML includes data
4. **Type-safe** - Loader types flow to components
5. **Better for SEO** - Content in HTML, not JavaScript

---

## Remix Patterns You Need to Know

### Pattern 1: Loading Data (Read)
```typescript
// app/routes/recipes.$recipeId.tsx
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { getRecipeById } from "~/lib/queries/recipes";

export const loader: LoaderFunction = async ({ params }) => {
  const recipe = await getRecipeById(params.recipeId!);
  if (!recipe) throw new Response("Not found", { status: 404 });
  return json(recipe);
};

export default function ViewRecipe() {
  const recipe = useLoaderData<typeof loader>();
  // ✨ Recipe data is here, no fetching needed!
  return <h1>{recipe.name}</h1>;
}
```

### Pattern 2: Submitting Forms (Create/Update)
```typescript
// app/routes/recipes.new.tsx
import { Form, redirect } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { createRecipe } from "~/lib/queries/recipes";

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const recipe = await createRecipe({
    name: data.get("name"),
    // ... other fields
  });
  return redirect(`/recipes/${recipe.id}`);
};

export default function NewRecipe() {
  return (
    <Form method="post">
      <input name="name" required />
      <button>Create Recipe</button>
    </Form>
  );
}
```

### Pattern 3: Deleting Data
```typescript
// app/routes/recipes.$recipeId.delete.tsx
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/react";

export const action: ActionFunction = async ({ params, request }) => {
  if (request.method !== "POST") throw new Response("Method not allowed");
  await deleteRecipe(params.recipeId!);
  return redirect("/recipes");
};
```

### Pattern 4: URL Parameters
```
// URL: /recipes/abc123/edit
// Route file: app/routes/recipes.$recipeId.edit.tsx
// Access: params.recipeId

// URL: /recipes/abc123/comments/xyz789
// Route file: app/routes/recipes.$recipeId.comments.$commentId.tsx
// Access: params.recipeId, params.commentId
```

---

## Common Mistakes to Avoid

### ❌ Don't Use useEffect for Data
```typescript
// WRONG - This will fetch data AFTER rendering
const [recipe, setRecipe] = useState(null);
useEffect(() => {
  fetch(`/recipes/${id}`).then(r => r.json()).then(setRecipe);
}, [id]);
return <div>{recipe?.name}</div>;
```

### ✅ Use Loader Instead
```typescript
// CORRECT - Data loads before render
export const loader = async ({ params }) => {
  return json(await getRecipeById(params.id));
};
export default function ViewRecipe() {
  const recipe = useLoaderData();
  return <div>{recipe.name}</div>;
}
```

### ❌ Don't Fetch from Client Components
```typescript
// WRONG
"use client";
function SearchBox() {
  async function handleSearch(query) {
    const results = await fetch(`/api/search?q=${query}`);
    // ...
  }
}
```

### ✅ Use useFetcher for Interactive Requests
```typescript
// CORRECT (for things like typeahead search)
import { useFetcher } from "@remix-run/react";

export default function SearchBox() {
  const fetcher = useFetcher();
  
  return (
    <fetcher.Form method="post" action="/api/search">
      <input name="q" onChange={(e) => fetcher.submit(e.target.form)} />
    </fetcher.Form>
  );
}
```

---

## Database with Drizzle ORM

### How to Write Queries

**Before (Raw SQL)**:
```typescript
const result = await pool.query(
  "SELECT * FROM recipes WHERE group_id = $1 ORDER BY name",
  [groupId]
);
const recipes = result.rows;
```

**After (Drizzle)**:
```typescript
import { db } from "~/lib/db";
import { recipes } from "~/lib/db.schema";
import { eq } from "drizzle-orm";

const recipes = await db
  .select()
  .from(recipes)
  .where(eq(recipes.groupId, groupId))
  .orderBy(recipes.name);
```

**Benefits**:
- Type-safe (TypeScript knows the columns)
- No SQL string bugs
- Readable
- Composable (can chain operations)

---

## Environment Setup

### .env File (Required)
```
NODE_ENV=development
PORT=3000
PGUSER=cookbook
PGHOST=localhost
PGPASSWORD=cookbook123
PGDATABASE=cookbook
PGPORT=5432
```

**For Production** (Docker):
- `PGHOST=cookbook-db` (Docker service name)
- Secure password instead of default
- `NODE_ENV=production`

---

## Testing Changes Locally

```bash
# Start dev server
npm run dev
# Visit: http://localhost:3000

# Check for errors
npm run type-check

# Build for production
npm run build

# Run production version
npm run preview

# Docker testing
docker-compose up          # Start all services
docker logs cookbook       # View logs
docker exec cookbook sh    # Access container shell
```

---

## File Reference Guide

### If you need to...

**Find original database queries**
- Look in: `api/src/data/cookbookdb.ts`
- Copy logic into: `app/lib/queries/*.ts`

**Find original API routes**
- Look in: `api/src/routes/*.ts`
- Copy handlers into: `app/routes/`

**Find original React components**
- Look in: `frontend/src/components/*.tsx`
- Copy into: `app/components/`

**Find original Next.js pages**
- Look in: `frontend/src/app/*.tsx`
- Convert into: `app/routes/*.tsx`

**Understand old database schema**
- Look in: `api/init.sql`
- Already defined in: `app/lib/db.schema.ts`

---

## Getting Help

### Documentation Files
1. **MIGRATION_GUIDE.md** - Complete step-by-step for all phases
2. **QUICK_START.md** - Quick reference and cheat sheets
3. **REMIX_MIGRATION_SCAFFOLD.md** - Project structure overview
4. **This file** - AI/Developer context

### External Resources
- [Remix Documentation](https://remix.run/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## What NOT to Do

- ❌ Delete or modify `api/` or `frontend/` during migration (use as reference)
- ❌ Run migration on `main` branch (this is a feature branch)
- ❌ Add new features before completing migration
- ❌ Keep old Express/Next.js code patterns in new files
- ❌ Skip TypeScript checks (`npm run type-check`)
- ❌ Deploy before Phase 11 is complete

---

## Quick Commands

```bash
# Navigate to project
cd C:\Users\voipm\repos\cookbook

# Install/update deps
npm install

# Development
npm run dev          # Start dev server
npm run type-check   # Check TypeScript
npm run lint         # Check code style
npm run lint:fix     # Auto-fix issues

# Production
npm run build        # Build for production
npm run preview      # Preview production build
docker-compose up    # Start via Docker

# Utilities
npx tsx scripts/test-db.ts  # Test database connection
npx drizzle-kit studio     # Visual DB explorer
```

---

## Success Criteria

When each phase is complete, you should be able to:

**Phase 2**: Connect to database and run queries
**Phase 3**: Build and see Tailwind styles working
**Phase 4**: List, view, create, edit, delete recipes
**Phase 5**: Manage recipe groups
**Phase 6**: Upload and display images
**Phase 7**: Import recipes from URLs
**Phase 8**: Components render without errors
**Phase 9**: All pages accessible at correct URLs
**Phase 10**: All QA tests pass
**Phase 11**: Docker container builds and runs
**Phase 12**: Old folders deleted, ready to deploy

---

## Current Blockers / Next Actions

### Currently
- Everything setup for Phase 2
- Database schema defined but not verified against live DB
- No query functions written yet

### Next
1. Start Phase 2
2. Verify database schema
3. Create first query functions
4. Test database connectivity
5. Proceed to Phase 3

---

## Contact/Handoff Notes

- **Project Owner**: Single developer (voipm)
- **Deployment Target**: Docker + production server
- **Database**: PostgreSQL (existing, at `localhost:5432`)
- **Branch Strategy**: Feature branch, will merge when complete

If you're taking over this context:
1. Read `QUICK_START.md` (5 min)
2. Read `MIGRATION_GUIDE.md` (15 min)
3. Look at `app/` folder structure
4. Check `npm run dev` starts without errors
5. Start with Phase 2 instructions

---

**Last Updated**: 2025-11-15
**Status**: Phase 1 Complete, Ready for Phase 2
**Next Milestone**: Database queries working by end of Phase 2

