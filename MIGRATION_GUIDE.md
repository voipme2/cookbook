# Cookbook: Next.js + Express → Remix Migration Guide

**Status**: Phase 1 Complete ✅ | Phase 2-12 Pending

## Project Overview

### Current State (This Branch)
- **Old Architecture**: Separate Next.js frontend + Express API + Nginx reverse proxy (3 Docker containers)
- **New Architecture**: Single Remix full-stack app + PostgreSQL (1 Docker container)
- **Branch**: This is a feature branch with the old code still present

### What's Been Completed
- ✅ Phase 1: New Remix project scaffold created
  - Dependencies configured (Express 4.20.0, React 18.3.0, Drizzle ORM)
  - Database schema defined with Drizzle
  - Basic routing structure in place
  - Single Dockerfile created
  - TypeScript configured
  - Build & dev servers verified working

### Project Structure

```
cookbook/
├── app/                              ← NEW: Remix application code (ONLY CHECK THIS)
│   ├── routes/
│   │   ├── _index.tsx               ← Home page (created)
│   │   ├── recipes/                 ← TODO: Create recipe routes
│   │   ├── groups/                  ← TODO: Create group routes
│   │   ├── import/                  ← TODO: Create import route
│   │   ├── print/                   ← TODO: Create print route
│   │   └── api/                     ← TODO: Create REST endpoints (if needed)
│   ├── components/
│   │   ├── NavBar.tsx               ← Created
│   │   ├── Layout.tsx               ← Created
│   │   ├── NavBarWrapper.tsx        ← Created
│   │   └── [other components]       ← TODO: Copy from frontend/src/components
│   ├── lib/
│   │   ├── db.ts                    ← Drizzle setup (created)
│   │   ├── db.schema.ts             ← Table definitions (created, needs verification)
│   │   └── queries/                 ← TODO: Create query functions
│   │       ├── recipes.ts           ← TODO: Recipe queries
│   │       ├── groups.ts            ← TODO: Group queries
│   │       └── images.ts            ← TODO: Image queries
│   ├── types/
│   │   └── index.ts                 ← TypeScript interfaces (created)
│   ├── root.tsx                     ← Root layout (created)
│   ├── root.css                     ← Global styles (created)
│   └── entry.server.tsx             ← Server entry (created)
├── api/                              ← OLD: Express API (TO DELETE IN PHASE 12)
│   ├── src/
│   │   ├── data/cookbookdb.ts       ← Reference: Database queries to migrate
│   │   ├── routes/                  ← Reference: Routes to migrate
│   │   ├── controllers/             ← Reference: Business logic to migrate
│   │   └── types/index.ts           ← Reference: Types already in app/types
│   └── Dockerfile                   ← OLD: To delete
├── frontend/                         ← OLD: Next.js frontend (TO DELETE IN PHASE 12)
│   ├── src/
│   │   ├── components/              ← Reference: Components to copy
│   │   ├── app/                     ← Reference: Pages to migrate
│   │   ├── lib/api.ts               ← Reference: API calls to convert
│   │   └── types/                   ← Reference: Types already migrated
│   └── Dockerfile                   ← OLD: To delete
├── package.json                     ← UPDATED: Unified dependencies
├── tsconfig.json                    ← UPDATED: Points to app/** only
├── vite.config.ts                   ← NEW: Build configuration
├── remix.config.js                  ← NEW: Remix configuration
├── Dockerfile                       ← NEW: Single production container
├── docker-compose.yml               ← NEW: Simplified orchestration (app + db)
├── .dockerignore                    ← NEW: Docker optimization
└── MIGRATION_GUIDE.md               ← This file
```

---

## Remaining Phases (Phases 2-12)

### Phase 2: Database Setup & Query Functions (2-3 days)

**Goal**: Set up Drizzle ORM query layer and verify database connectivity

**Files to Create**:
- `app/lib/queries/recipes.ts` - Recipe CRUD operations
- `app/lib/queries/groups.ts` - Group CRUD operations
- `app/lib/queries/images.ts` - Image metadata operations
- `scripts/migrate.ts` - Database migration runner
- `scripts/seed-db.ts` - Optional: database seeding script

**Steps**:
1. **Verify Database Schema** 
   - Check that `app/lib/db.schema.ts` matches the existing PostgreSQL schema
   - Compare with `api/init.sql` 
   - Update table definitions if needed (timestamps, defaults, indexes)

2. **Create Query Functions**
   - Open `api/src/data/cookbookdb.ts` for reference
   - Create `app/lib/queries/recipes.ts`:
     ```typescript
     import { db } from "~/lib/db";
     import { recipes, groups } from "~/lib/db.schema";
     import { eq, like, and } from "drizzle-orm";
     
     export async function getAllRecipes() {
       return await db.select().from(recipes).orderBy(recipes.name);
     }
     
     export async function getRecipeById(id: string) {
       const result = await db
         .select()
         .from(recipes)
         .where(eq(recipes.id, id))
         .limit(1);
       return result[0];
     }
     
     export async function searchRecipes(query: string) {
       return await db
         .select()
         .from(recipes)
         .where(like(recipes.name, `%${query}%`))
         .orderBy(recipes.name);
     }
     
     // ... more functions for insert, update, delete
     ```
   - Create `app/lib/queries/groups.ts` (similar pattern)
   - Create `app/lib/queries/images.ts` (similar pattern)

3. **Set Up Drizzle Migrations**
   - Create `drizzle.config.ts`:
     ```typescript
     import type { Config } from "drizzle-kit";
     
     export default {
       schema: "./app/lib/db.schema.ts",
       out: "./drizzle",
       driver: "pg",
       dbCredentials: {
         connectionString: process.env.DATABASE_URL || "postgresql://cookbook:cookbook123@localhost:5432/cookbook",
       },
     } satisfies Config;
     ```
   - Run `npx drizzle-kit generate:pg` to generate migrations
   - Add `npx drizzle-kit migrate` to deployment script

4. **Test Database Connectivity**
   - Start PostgreSQL locally (or connect to remote)
   - Verify `.env` has correct database credentials
   - Create a simple test file: `scripts/test-db.ts`
     ```typescript
     import { db } from "~/lib/db";
     import { recipes } from "~/lib/db.schema";
     
     async function test() {
       try {
         const count = await db.select().from(recipes).limit(1);
         console.log("✅ Database connected! Recipes table accessible");
         console.log("Sample recipe:", count[0]);
       } catch (error) {
         console.error("❌ Database error:", error);
       }
     }
     test();
     ```
   - Run: `npx tsx scripts/test-db.ts`

**Verification**:
- ✅ All query functions work without errors
- ✅ Can read/write to PostgreSQL successfully
- ✅ Drizzle migrations generated

---

### Phase 3: Migrate Styles & Assets (1 day)

**Goal**: Set up styling and copy over static assets

**Files to Update**:
- `app/root.css` - Global styles
- `public/images/` - Recipe images

**Steps**:
1. **Copy Images**
   - Copy all images from `api/images/` → `public/images/`
   - These will be served as static files at `/images/`

2. **Ensure Tailwind Works**
   - Verify `tailwind.config.ts` exists and is correct
   - Verify `postcss.config.mjs` exists and is correct
   - Check that `app/root.css` has `@tailwind` directives
   - Test build: `npm run build` should include Tailwind output

3. **Update Image References**
   - Old API served images at `/api/images/:id`
   - New app serves static images at `/images/filename.jpg`
   - All recipe image paths in database should point to static filenames

**Verification**:
- ✅ `npm run build` succeeds
- ✅ Tailwind CSS classes work in components
- ✅ Images display correctly in components

---

### Phase 4: Migrate Recipe Routes (2-3 days)

**Goal**: Convert Express recipe routes to Remix loaders/actions

**Reference Files**:
- `api/src/routes/recipes.ts` - Old Express routes
- `api/src/controllers/recipesController.ts` - Business logic
- `frontend/src/app/page.tsx` - Recipe list UI
- `frontend/src/app/view/[recipeId]/page.tsx` - Recipe detail UI

**Files to Create**:
- `app/routes/recipes._index.tsx` - List all recipes (GET /recipes)
- `app/routes/recipes.$recipeId.tsx` - View single recipe (GET /recipes/:id)
- `app/routes/recipes.new.tsx` - Create recipe form (GET/POST /recipes/new)
- `app/routes/recipes.$recipeId.edit.tsx` - Edit recipe form (GET/POST /recipes/:id/edit)
- `app/routes/recipes.$recipeId.delete.tsx` - Delete recipe (POST /recipes/:id/delete)

**Steps**:

1. **Create List Route** (`app/routes/recipes._index.tsx`)
   ```typescript
   import { json } from "@remix-run/node";
   import type { LoaderFunction } from "@remix-run/node";
   import { useLoaderData } from "@remix-run/react";
   import { getAllRecipes } from "~/lib/queries/recipes";
   
   export const loader: LoaderFunction = async () => {
     const recipes = await getAllRecipes();
     return json(recipes);
   };
   
   export default function RecipesList() {
     const recipes = useLoaderData<typeof loader>();
     return (
       <div>
         {/* Copy UI from frontend/src/components/RecipeList.tsx */}
       </div>
     );
   }
   ```

2. **Create View Route** (`app/routes/recipes.$recipeId.tsx`)
   ```typescript
   import { json } from "@remix-run/node";
   import type { LoaderFunction } from "@remix-run/node";
   import { useLoaderData } from "@remix-run/react";
   import { getRecipeById } from "~/lib/queries/recipes";
   
   export const loader: LoaderFunction = async ({ params }) => {
     const recipe = await getRecipeById(params.recipeId!);
     if (!recipe) {
       throw new Response("Recipe not found", { status: 404 });
     }
     return json(recipe);
   };
   
   export default function ViewRecipe() {
     const recipe = useLoaderData<typeof loader>();
     return (
       <div>
         {/* Copy UI from frontend/src/components/ViewRecipe.tsx */}
       </div>
     );
   }
   ```

3. **Create New Recipe Route** (`app/routes/recipes.new.tsx`)
   ```typescript
   import { json, redirect } from "@remix-run/node";
   import type { ActionFunction } from "@remix-run/node";
   import { useLoaderData, Form } from "@remix-run/react";
   import { createRecipe } from "~/lib/queries/recipes";
   
   export const action: ActionFunction = async ({ request }) => {
     if (request.method !== "POST") {
       return json({ error: "Method not allowed" }, { status: 405 });
     }
     
     const formData = await request.formData();
     const recipe = await createRecipe({
       name: formData.get("name"),
       // ... other fields
     });
     
     return redirect(`/recipes/${recipe.id}`);
   };
   
   export default function NewRecipe() {
     return (
       <Form method="post">
         {/* Copy UI from frontend/src/app/new/page.tsx */}
       </Form>
     );
   }
   ```

4. **Create Edit Route** (`app/routes/recipes.$recipeId.edit.tsx`)
   - Similar pattern to new route but use `updateRecipe`
   - Load existing recipe in loader
   - Pre-fill form with current values

5. **Create Delete Route** (`app/routes/recipes.$recipeId.delete.tsx`)
   ```typescript
   import { redirect } from "@remix-run/node";
   import type { ActionFunction } from "@remix-run/node";
   import { deleteRecipe } from "~/lib/queries/recipes";
   
   export const action: ActionFunction = async ({ params, request }) => {
     if (request.method !== "POST") {
       return { error: "Method not allowed" };
     }
     await deleteRecipe(params.recipeId!);
     return redirect("/recipes");
   };
   ```

**Key Differences from Next.js**:
- **No `useEffect` for data loading** - Use `loader` instead
- **No client-side API calls** - Data loads on server, passed to component
- **Forms use `<Form>` component** - Automatically submits via `action`
- **Route params in `params` object** - Not in URL like Next.js

**Verification**:
- ✅ `npm run build` succeeds
- ✅ Can view recipe list: `/recipes`
- ✅ Can view single recipe: `/recipes/[id]`
- ✅ Can create recipe: `/recipes/new` → POST to same route
- ✅ Can edit recipe: `/recipes/[id]/edit`
- ✅ Can delete recipe: POST to `/recipes/[id]/delete`

---

### Phase 5: Migrate Groups Routes (1-2 days)

**Goal**: Convert Express group routes to Remix

**Reference Files**:
- `api/src/routes/groups.ts`
- `frontend/src/app/groups/`

**Files to Create**:
- `app/routes/groups._index.tsx` - List groups
- `app/routes/groups.$groupId.tsx` - View group recipes
- `app/routes/groups.manage.tsx` - Manage groups (create/edit/delete)

**Steps**: Follow same pattern as Phase 4

**Verification**:
- ✅ Can list groups: `/groups`
- ✅ Can view group recipes: `/groups/[id]`
- ✅ Can manage groups: `/groups/manage`

---

### Phase 6: Migrate Image Handling (1-2 days)

**Goal**: Convert image upload/serving to Remix

**Reference Files**:
- `api/src/routes/imageRoutes.ts`
- `api/src/controllers/imageController.ts`
- `frontend/src/components/ImageUploader.tsx`

**Files to Create**:
- `app/routes/api/upload.ts` - Image upload endpoint (POST)
- `app/routes/api/images.$imageId.ts` - Serve image (GET)

**Steps**:

1. **Create Upload Endpoint** (`app/routes/api/upload.ts`)
   ```typescript
   import { json } from "@remix-run/node";
   import type { ActionFunction } from "@remix-run/node";
   import { unstable_parseMultipartFormData } from "@remix-run/node";
   import multer from "multer";
   
   const upload = multer({ dest: "public/images" });
   
   export const action: ActionFunction = async ({ request }) => {
     if (request.method !== "POST") {
       return json({ error: "Method not allowed" }, { status: 405 });
     }
     
     // Parse multipart form data
     const formData = await unstable_parseMultipartFormData(request, storage);
     const file = formData.get("image");
     
     // Reference: api/src/controllers/imageController.ts
     // Save file, create image record, return image URL
     
     return json({ url: `/images/${filename}` });
   };
   ```

2. **Copy Images to Public**
   - Already done in Phase 3
   - Images served statically at `/images/`

**Verification**:
- ✅ Can upload images
- ✅ Images appear at `/images/` URLs
- ✅ Images persist after restart

---

### Phase 7: Migrate Recipe Scraper (1 day)

**Goal**: Convert web scraper route to Remix

**Reference Files**:
- `api/src/routes/scraper.ts`

**Files to Create**:
- `app/routes/api/scraper.ts` - Import recipe from URL (POST)

**Steps**:
1. Copy scraper logic from `api/src/routes/scraper.ts`
2. Convert to Remix action
3. Test with known recipe URLs

---

### Phase 8: Migrate Components (2-3 days)

**Goal**: Copy all React components from Next.js to Remix with minimal changes

**Components to Copy/Update**:
- `RecipeCard.tsx`
- `RecipeList.tsx`
- `ViewRecipe.tsx`
- `Ingredients.tsx`
- `Steps.tsx`
- `SearchBox.tsx`
- `GroupManager.tsx`
- `GroupTemplates.tsx`
- `ImageUploader.tsx`
- `AutoResizeTextarea.tsx`
- `NavBar.tsx` ✅ Already exists
- `Layout.tsx` ✅ Already exists

**Steps**:
1. Copy each component from `frontend/src/components/` → `app/components/`
2. Update imports:
   - `@/lib/api` → `~/lib/queries/` (now server-side, won't work client-side)
   - `@/types` → `~/types`
   - `@/components` → `~/components`
3. **Remove fetch calls** - Data comes from loader instead
4. Replace `useEffect` + `useState` with direct props from loader
5. Fix any Client Component imports with `"use client"` → just remove it (not needed in Remix)

**Example Conversion**:

Before (Next.js):
```typescript
"use client";
import { useEffect, useState } from "react";
import { getRecipeById } from "@/lib/api";

export function ViewRecipe({ recipeId }: { recipeId: string }) {
  const [recipe, setRecipe] = useState(null);
  
  useEffect(() => {
    getRecipeById(recipeId).then(setRecipe);
  }, [recipeId]);
  
  return <div>{recipe?.name}</div>;
}
```

After (Remix):
```typescript
import type { Recipe } from "~/types";

export function ViewRecipe({ recipe }: { recipe: Recipe }) {
  return <div>{recipe.name}</div>;
}
```

**Verification**:
- ✅ All components import correctly
- ✅ No TypeScript errors
- ✅ Components render without data-fetching logic

---

### Phase 9: Migrate Frontend Pages (2-3 days)

**Goal**: Convert Next.js pages to Remix routes using migrated components

**Pages to Convert**:
- `page.tsx` (home) → `_index.tsx`
- `view/[recipeId]/page.tsx` → `recipes.$recipeId.tsx`
- `edit/[recipeId]/page.tsx` → `recipes.$recipeId.edit.tsx`
- `new/page.tsx` → `recipes.new.tsx`
- `groups/page.tsx` → `groups._index.tsx`
- `groups/[groupId]/page.tsx` → `groups.$groupId.tsx`
- `import/page.tsx` → `import._index.tsx`
- `print/[recipeId]/page.tsx` → `print.$recipeId.tsx`

**Steps**:
1. For each page, create corresponding Remix route
2. Extract data-loading logic → put in `loader`
3. Extract form submission logic → put in `action`
4. Use `useLoaderData()` to get data
5. Use `<Form>` for form submissions
6. Copy JSX/styling unchanged

**Verification**:
- ✅ All pages accessible at same URLs
- ✅ Data loads correctly
- ✅ Forms submit correctly
- ✅ Navigation works

---

### Phase 10: Testing & QA (2-3 days)

**Goal**: Verify all functionality works in new Remix app

**Test Cases**:

1. **Recipe Management**
   - ✅ List recipes (load all, with pagination if exists)
   - ✅ View recipe (single recipe, ingredients, steps)
   - ✅ Create recipe (form validation, save to DB)
   - ✅ Edit recipe (load existing, update in DB)
   - ✅ Delete recipe (remove from DB)
   - ✅ Search recipes (by name, by group)

2. **Groups Management**
   - ✅ List groups
   - ✅ Create group
   - ✅ Edit group
   - ✅ Delete group
   - ✅ Assign recipes to groups

3. **Image Handling**
   - ✅ Upload recipe image
   - ✅ Image displays on recipe detail page
   - ✅ Image persists after restart

4. **Import/Scraper**
   - ✅ Import recipe from URL
   - ✅ Recipe data extracted correctly
   - ✅ Image downloaded if available

5. **Print**
   - ✅ Print recipe (generates printable format)
   - ✅ Styles work correctly for printing

6. **Performance**
   - ✅ Pages load quickly
   - ✅ Search results fast
   - ✅ No N+1 queries (use Drizzle `with` for relations)

**Testing Commands**:
```bash
npm run dev              # Start dev server
npm run build           # Build for production
npm run lint            # Check code style
npm run type-check      # Check types
```

**Verification**:
- ✅ All routes work
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ Database queries optimized

---

### Phase 11: Docker & Deployment (1-2 days)

**Goal**: Build and deploy single Docker container

**Files Already Created**:
- ✅ `Dockerfile` - Production image
- ✅ `docker-compose.yml` - Local dev/prod setup
- ✅ `.dockerignore` - Optimization

**Steps**:

1. **Build Docker Image**
   ```bash
   docker-compose build
   ```

2. **Start Services**
   ```bash
   docker-compose up
   ```
   - Should start: `cookbook` app + `cookbook-db` database
   - App available at `http://localhost:3000`

3. **Verify in Container**
   ```bash
   docker exec cookbook npm run type-check  # Inside container
   curl http://localhost:3000               # Test connection
   ```

4. **Database Migration in Docker**
   ```bash
   docker exec cookbook npm run db:migrate
   ```

5. **Push Image to Registry** (if deploying)
   ```bash
   docker tag cookbook:latest your-registry/cookbook:latest
   docker push your-registry/cookbook:latest
   ```

**Verification**:
- ✅ Docker image builds successfully
- ✅ Container starts without errors
- ✅ App accessible at localhost:3000
- ✅ Database migrations run
- ✅ All routes work in container

---

### Phase 12: Cleanup & Final Polish (1 day)

**Goal**: Remove old code, consolidate configuration

**Files to Delete**:
- ❌ `api/` folder (entire directory)
- ❌ `frontend/` folder (entire directory)
- ❌ `nginx/` folder (no longer needed)
- ❌ Old Dockerfiles (if separate ones exist)
- ❌ Old scripts (if in root, like `rebuild-api.sh`)

**Files to Keep**:
- ✅ `api/init.sql` - Database schema (reference only)
- ✅ `api/backups/` - Keep for reference

**Steps**:

1. **Clean Up Root Directory**
   ```bash
   rm -rf api/
   rm -rf frontend/
   rm -rf nginx/
   rm rebuild-api.sh rebuild-api.ps1
   rm docker-compose.dev.yml (if exists)
   ```

2. **Update Root README.md**
   - Document new single-container architecture
   - Update setup instructions
   - Document environment variables
   - Document how to deploy

3. **Consolidate Configurations**
   - Move any useful webpack/build config to root if needed
   - Ensure all paths in configs point to new structure

4. **Final Verification**
   ```bash
   npm run build      # Should build without errors
   npm run dev        # Should start dev server
   docker-compose up  # Should start all services
   ```

5. **Commit & Tag**
   ```bash
   git add -A
   git commit -m "chore: complete remix migration (phases 1-12)"
   git tag v2.0.0     # Mark major version
   ```

**Verification**:
- ✅ No old folders remaining (except backups/)
- ✅ All npm scripts work
- ✅ Docker builds and runs
- ✅ Database works
- ✅ All routes accessible

---

## Environment Variables

**Required in `.env`**:
```
NODE_ENV=development
PORT=3000

# PostgreSQL Database
PGUSER=cookbook
PGHOST=localhost
PGPASSWORD=cookbook123
PGDATABASE=cookbook
PGPORT=5432

# Image uploads
IMAGE_UPLOAD_DIR=./public/images
```

**For Production** (in Docker):
```
NODE_ENV=production
PGHOST=cookbook-db        # Docker hostname
PGUSER=cookbook
PGPASSWORD=<secure-password>
PGDATABASE=cookbook
PGPORT=5432
```

---

## Important Notes

### Data Migration
- **Existing recipes**: Will work as-is (no schema changes needed)
- **Image paths**: Update database if using old `/api/images/:id` paths
- **Backwards compatibility**: None - this is a clean rewrite

### Performance Considerations
- **Drizzle ORM**: Minimal overhead, should be faster than raw queries
- **Single container**: Slightly more resource efficient than 3 containers
- **Tailwind CSS**: Pre-compiled, no runtime overhead

### Common Gotchas
1. **Route naming**: 
   - Remix uses `$param` syntax, not `[param]` like Next.js
   - `.` separates route segments: `recipes.new` = `/recipes/new`
   - `_index` = default for that directory

2. **Data fetching**:
   - Never use `fetch()` in Remix components during render
   - All data must come from `loader` or passed as props
   - Can use `useFetcher` for background requests

3. **Forms**:
   - Always use `<Form>` component, not `<form>`
   - Submit to same route with `action` function
   - Use `FormData` API for multipart (file uploads)

4. **Styling**:
   - Global CSS in `root.css`
   - Component CSS inline or in Tailwind classes
   - No CSS modules needed (but supported if you add them)

5. **Database**:
   - Drizzle queries return promises, must be awaited
   - Always include error handling
   - Use transactions for multi-step operations

### Debugging

**Dev Server Issues**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Run build to see if production works
npm run build
```

**Database Issues**:
```bash
# Test connection
npx tsx scripts/test-db.ts

# Check migrations
npx drizzle-kit drop
npx drizzle-kit generate:pg
npx drizzle-kit migrate
```

**Docker Issues**:
```bash
# Check logs
docker logs cookbook

# Access container shell
docker exec -it cookbook sh

# Rebuild image
docker-compose build --no-cache
```

---

## Phase Checklist

### Phase 1: ✅ COMPLETE
- [x] Dependencies installed
- [x] TypeScript configured
- [x] Database schema defined
- [x] Basic routing works
- [x] Build succeeds
- [x] Dev server runs

### Phase 2: ⏳ TODO
- [ ] Database schema verified
- [ ] Query functions created (recipes, groups, images)
- [ ] Drizzle migrations set up
- [ ] Database connectivity tested

### Phase 3: ⏳ TODO
- [ ] Images copied to `public/images/`
- [ ] Tailwind CSS verified
- [ ] Global styles finalized

### Phase 4: ⏳ TODO
- [ ] Recipe routes created (list, view, create, edit, delete)
- [ ] Search functionality works
- [ ] All recipe tests pass

### Phase 5: ⏳ TODO
- [ ] Group routes created
- [ ] Group management works

### Phase 6: ⏳ TODO
- [ ] Image upload working
- [ ] Images served from `/images/`

### Phase 7: ⏳ TODO
- [ ] Recipe scraper/import working

### Phase 8: ⏳ TODO
- [ ] All components copied and updated
- [ ] No fetch calls in components
- [ ] Components take data as props

### Phase 9: ⏳ TODO
- [ ] All pages converted to Remix routes
- [ ] All routes accessible at same URLs
- [ ] Form submissions work

### Phase 10: ⏳ TODO
- [ ] QA testing complete
- [ ] No console errors
- [ ] All features working

### Phase 11: ⏳ TODO
- [ ] Docker image builds
- [ ] Container runs correctly
- [ ] App accessible at localhost:3000
- [ ] Database migrations run in container

### Phase 12: ⏳ TODO
- [ ] Old folders deleted
- [ ] README updated
- [ ] Final commit and tag
- [ ] Ready for production deployment

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run type-check      # Check TypeScript
npm run lint            # ESLint
npm run lint:fix        # Auto-fix linting issues

# Database
npx drizzle-kit studio  # Visual database explorer
npm run db:migrate      # Run migrations

# Docker
docker-compose up       # Start all services
docker-compose down     # Stop all services
docker-compose logs     # View logs
docker-compose build    # Rebuild image

# Utilities
npx tsx scripts/test-db.ts      # Test database connection
npx drizzle-kit generate:pg     # Generate migrations
```

---

## File Reference

### Database
- `app/lib/db.ts` - Drizzle connection setup
- `app/lib/db.schema.ts` - Table definitions
- `app/lib/queries/*.ts` - Query functions
- `api/init.sql` - Old schema (reference only)
- `api/src/data/cookbookdb.ts` - Old queries (reference)

### Routes & Pages
- `app/routes/` - All pages and API endpoints
- `api/src/routes/` - Old Express routes (reference)
- `frontend/src/app/` - Old Next.js pages (reference)

### Components
- `app/components/` - React components
- `frontend/src/components/` - Old components (reference)

### Types
- `app/types/index.ts` - TypeScript interfaces
- `api/src/types/index.ts` - Old types (reference)
- `frontend/src/types/` - Old types (reference)

---

## Next Steps

1. **Read this document** in full
2. **Review the scaffolding** - Check `REMIX_MIGRATION_SCAFFOLD.md`
3. **Start Phase 2** - Begin with database setup
4. **Follow each phase** in order (they have dependencies)
5. **Test after each phase** - Don't wait until the end
6. **Commit after major milestones** - Each phase completion

---

**Questions?** Check the [Remix Docs](https://remix.run/docs) or look at the old code in `api/` and `frontend/` folders for reference.

**Status**: Ready to start Phase 2! 🚀

