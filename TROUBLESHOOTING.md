# Troubleshooting Guide

## Common Issues and Solutions

### Installation & Setup

#### Issue: `npm install` fails with peer dependency errors
```
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution**:
```bash
# Clear cache and try again
npm cache clean --force
npm install

# If still fails, use legacy peer deps (not ideal but works)
npm install --legacy-peer-deps
```

**Root Cause**: Version conflicts between Remix and dependencies
- Express must be 4.20.0 (not 5.x)
- React must be 18.3.0 (not 19.x for current Remix)
- These are already correct in `package.json`

---

#### Issue: `npm run build` fails with "Remix Vite plugin not found"
```
Remix Vite plugin not found in Vite config
```

**Solution**: Check `vite.config.ts` has:
```typescript
import { vitePlugin as remix } from "@remix-run/dev";

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
});
```

**Not**:
```typescript
import { remix } from "@remix-run/dev";  // ❌ Wrong import
```

---

#### Issue: TypeScript errors from old `frontend/` or `api/` folders
```
frontend/src/app/page.tsx(5,20): error TS2307: Cannot find module '@/lib/api'
```

**Solution**: Already fixed in Phase 1
- Check `tsconfig.json` includes only `app/**`
- Should have:
  ```json
  "include": ["remix.env.d.ts", "app/**/*.ts", "app/**/*.tsx"],
  "exclude": ["node_modules", "build", "dist", "frontend", "api"]
  ```

---

### Development Server

#### Issue: `npm run dev` crashes immediately
```
Error: Cannot find module 'remix'
```

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

---

#### Issue: Dev server hangs or runs very slowly
```
Rebuilding... (takes 30+ seconds)
```

**Solution**:
- Check CPU/memory usage (might be maxed out)
- Clear build cache:
  ```bash
  rm -rf build node_modules/.vite
  npm run build
  ```
- Try updating packages:
  ```bash
  npm update
  ```

---

#### Issue: Changes not reflecting in dev server
```
Edit file, reload page, but old content shows
```

**Solution**:
1. Check if the file you edited is in `app/` folder (not `api/` or `frontend/`)
2. Look for the file in the build output
3. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Restart dev server: Stop with `Ctrl+C`, then `npm run dev`

---

### Database Issues

#### Issue: "Cannot connect to PostgreSQL"
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**:

1. **Check if PostgreSQL is running**:
   ```bash
   # On Windows (if installed locally)
   Get-Service postgresql
   
   # On Mac/Linux
   pg_isready
   ```

2. **Check `.env` file**:
   ```
   PGHOST=localhost      # ✅ for local dev
   PGHOST=cookbook-db    # ✅ for Docker
   PGPORT=5432
   PGUSER=cookbook
   PGPASSWORD=cookbook123
   PGDATABASE=cookbook
   ```

3. **Test connection**:
   ```bash
   npx tsx scripts/test-db.ts
   ```

4. **If using Docker**:
   ```bash
   docker-compose up     # Start database
   docker logs cookbook-db  # Check logs
   ```

---

#### Issue: "Table does not exist"
```
error: relation "recipes" does not exist
```

**Solution**:

1. **Check if migrations ran**:
   ```bash
   npm run db:migrate
   ```

2. **If no migration files exist, generate them**:
   ```bash
   npx drizzle-kit generate:pg
   npx drizzle-kit migrate
   ```

3. **If error persists, seed the database**:
   ```bash
   psql -U cookbook -d cookbook -f api/init.sql
   ```

4. **Verify schema exists**:
   ```bash
   psql -U cookbook -d cookbook -c "\dt"
   ```
   Should show: `recipes`, `groups`, `images` tables

---

#### Issue: "Drizzle query returns wrong type"
```
Property 'id' does not exist on type 'unknown'
```

**Solution**: Use `as typeof loader` or `as Recipe`:
```typescript
// ❌ Wrong
const recipes = useLoaderData();
recipes.forEach(r => r.id);  // Error: r is unknown

// ✅ Correct
const recipes = useLoaderData<typeof loader>();
recipes.forEach(r => r.id);  // OK: TypeScript knows r is Recipe

// ✅ Also correct
import type { Recipe } from "~/types";
const recipes = useLoaderData<Recipe[]>();
```

---

### Routing Issues

#### Issue: Route not found (404)
```
Page shows "404 not found" for /recipes/new
```

**Solution**:
- Remix uses different route naming than Next.js
- For `/recipes/new`, filename must be `recipes.new.tsx` (not `recipes/new.tsx`)
- For `/recipes/:id`, filename must be `recipes.$id.tsx` (not `recipes/[id].tsx`)

**Check route file naming**:
```
✅ CORRECT
app/routes/recipes.new.tsx           → /recipes/new
app/routes/recipes.$recipeId.tsx     → /recipes/:recipeId
app/routes/recipes.$recipeId.edit.tsx → /recipes/:recipeId/edit

❌ WRONG
app/routes/recipes/new.tsx
app/routes/recipes/[id].tsx
app/routes/recipes/[id]/edit.tsx
```

---

#### Issue: Dynamic route params not available
```
Loader can't access recipe ID
```

**Solution**: Use `params` from loader context:
```typescript
// ✅ Correct
export const loader = async ({ params }) => {
  console.log(params.recipeId);  // ← Available!
  return json(recipe);
};

// ❌ Wrong
export const loader = async ({ request }) => {
  const id = new URL(request.url).pathname; // Fragile
};
```

---

### Form & Action Issues

#### Issue: Form submission does nothing
```html
<Form method="post">
  <input name="name" />
  <button>Submit</button>
</Form>
```
*(User clicks button but nothing happens)*

**Solution**: Make sure route has an `action` function:
```typescript
// ✅ Correct
export const action: ActionFunction = async ({ request }) => {
  if (request.method === "POST") {
    const data = await request.formData();
    // Process data
    return redirect("/success");
  }
};

// ❌ Wrong - no action function!
export default function Form() {
  return <form>...</form>;
}
```

---

#### Issue: Form data not submitted correctly
```
Submitted formData is always empty
```

**Solution**: Use `<Form>` component, not `<form>`:
```typescript
// ✅ Correct - use Remix Form
import { Form } from "@remix-run/react";
<Form method="post">
  <input name="username" />
</Form>

// ❌ Wrong - use HTML form
<form method="post">
  <input name="username" />
</form>
```

---

#### Issue: "Method POST not allowed"
```
POST /recipes returned 405 Method not allowed
```

**Solution**: Route must handle the method:
```typescript
export const action: ActionFunction = async ({ request }) => {
  // ✅ Check method
  if (request.method === "POST") {
    // Process POST
  }
  if (request.method === "PUT") {
    // Process PUT
  }
  if (request.method === "DELETE") {
    // Process DELETE
  }
  
  // ❌ If no match
  throw new Response("Method not allowed", { status: 405 });
};
```

---

### Component Issues

#### Issue: "useLoaderData() must be used in a route component"
```
Error: useLoaderData must be called within a data router
```

**Solution**: `useLoaderData` only works in route components, not sub-components:
```typescript
// ❌ Wrong - useLoaderData in sub-component
function RecipeTitle() {
  const recipe = useLoaderData();  // Error!
  return <h1>{recipe.name}</h1>;
}

// ✅ Correct - useLoaderData in route
export default function Recipe() {
  const recipe = useLoaderData<typeof loader>();
  return <RecipeTitle recipe={recipe} />;
}

// ✅ Sub-component receives props
function RecipeTitle({ recipe }) {
  return <h1>{recipe.name}</h1>;
}
```

---

#### Issue: State not persisting between renders
```
User types in input, but text disappears
```

**Solution**: Usually a re-render issue. Make sure:
1. Component is properly wrapped in `<Form>` if it's a form
2. State is managed at route level, not in sub-components
3. No unintended re-mounts

---

#### Issue: Image not displaying
```
<img src="/images/recipe.jpg" /> shows broken image
```

**Solution**:
1. Check image exists at `public/images/recipe.jpg`
2. Check path is correct - should be `/images/` not `/api/images/`
3. Check server is serving static files:
   ```bash
   curl http://localhost:3000/images/recipe.jpg
   ```

---

### Docker Issues

#### Issue: Docker build fails
```
failed to load config from vite.config.ts
```

**Solution**: Build happens during Docker build, requires Node. Check:
1. `vite.config.ts` exists and is valid
2. All dependencies in `package.json` exist
3. `app/` folder structure is correct

Try rebuilding:
```bash
docker-compose build --no-cache
```

---

#### Issue: Container starts but app won't connect
```
curl: (7) Failed to connect to localhost port 3000: Connection refused
```

**Solution**:
1. Check container is running:
   ```bash
   docker ps
   ```

2. Check logs:
   ```bash
   docker logs cookbook
   ```

3. Check port mapping:
   ```bash
   docker port cookbook
   ```
   Should show: `3000/tcp -> 0.0.0.0:3000`

4. If needed, restart:
   ```bash
   docker-compose restart
   ```

---

#### Issue: Database connection fails in Docker
```
Error: connect ECONNREFUSED db:5432
```

**Solution**:
- Container name matters! Should be `cookbook-db` (not `localhost`)
- In Docker, use service name from `docker-compose.yml`:
  ```
  PGHOST=cookbook-db    # Service name, not localhost
  ```
- Check services are running:
  ```bash
  docker-compose ps
  ```

---

### Performance Issues

#### Issue: App is slow, builds take 30+ seconds
```
Building... (this shouldn't take this long)
```

**Solution**:
1. Clear cache:
   ```bash
   rm -rf .turbo build node_modules/.vite
   ```

2. Check Node version (should be 18+):
   ```bash
   node --version
   ```

3. Check disk space:
   ```powershell
   Get-Volume     # Windows
   df -h          # Mac/Linux
   ```

4. Update packages:
   ```bash
   npm update
   npm cache clean --force
   ```

---

#### Issue: Database queries are slow
```
Query takes 5+ seconds
```

**Solution**:
1. Check indexes on frequently queried columns
2. Use `@` operator in Drizzle for relations:
   ```typescript
   await db.select()
     .from(recipes)
     .where(eq(recipes.groupId, groupId))  // ← Make sure this has an index
   ```

3. Profile the query:
   ```typescript
   const start = Date.now();
   const result = await db.select()...;
   console.log(`Query took ${Date.now() - start}ms`);
   ```

---

### Migration Issues

#### Issue: You're on the wrong phase
```
"I don't have the query functions yet but I need to write routes"
```

**Solution**: Follow phases in order!
- Phases have dependencies
- Can't write routes without database queries
- Can't deploy without testing

**Follow the checklist in `MIGRATION_GUIDE.md`**

---

#### Issue: Old code still present in new routes
```
New route still has old Next.js patterns:
- useEffect with fetch
- next/router imports
- 'use client' directives
```

**Solution**: Clean up and rewrite:
1. Remove all `useEffect` hooks
2. Remove `'use client'` directives
3. Move data fetching to `loader`
4. Use Remix components: `<Form>`, `<Link>`, etc.
5. Import from `@remix-run/react`, not `next/router`

---

### Version Conflicts

#### Issue: Package versions don't match
```
"@remix-run/node": "^2.10.0" but installed 2.17.2
```

**This is OK!** The `^` means "compatible version". As long as major version matches (2.x), minor updates are fine.

If you need exact versions, change to:
```json
"@remix-run/node": "2.10.0"  // Exact version
```

Then reinstall:
```bash
npm install
```

---

## Getting More Help

### If You're Stuck

1. **Check the error message carefully** - It usually tells you what's wrong
2. **Search in this guide** - Keyword from error message
3. **Check AI_CONTEXT.md** - Concepts and patterns
4. **Look at reference code** - In `api/` and `frontend/` folders
5. **Read Remix docs** - https://remix.run/docs

### Debug Mode

Enable more verbose output:
```bash
# Verbose build
npm run build -- --verbose

# Debug dev server
DEBUG=* npm run dev

# TypeScript in watch mode
tsc --watch
```

### If Still Stuck

1. **Try rolling back to last working state**:
   ```bash
   git diff  # See what changed
   git checkout -- <file>  # Undo changes
   ```

2. **Try from scratch**:
   ```bash
   rm -rf node_modules build .turbo
   npm install
   npm run build
   ```

3. **Check git status**:
   ```bash
   git status
   git log --oneline -5
   ```

---

## Common Typos

### Route Filenames
| Wrong | Correct | Serves |
|-------|---------|--------|
| `recipes/index.tsx` | `recipes._index.tsx` | `/recipes` |
| `recipes/[id].tsx` | `recipes.$id.tsx` | `/recipes/:id` |
| `recipes/[id]/edit.tsx` | `recipes.$id.edit.tsx` | `/recipes/:id/edit` |
| `api/recipes.ts` | `api/recipes.ts` | `/api/recipes` |

### Imports
| Wrong | Correct |
|-------|---------|
| `import from "@/types"` | `import from "~/types"` |
| `import from "@remix-run/node"` | `import { json } from "@remix-run/node"` |
| `<form>` in Remix | `<Form>` |
| `useRouter` (Next.js) | `useNavigate` (Remix) |

---

## Checklist Before Asking for Help

- [ ] Ran `npm install` successfully
- [ ] Ran `npm run type-check` (no errors)
- [ ] Ran `npm run build` (succeeds)
- [ ] Dev server starts: `npm run dev`
- [ ] Check file is in `app/` folder, not `api/` or `frontend/`
- [ ] Checked error message (usually clear)
- [ ] Searched this troubleshooting guide
- [ ] Looked at reference code in old folders
- [ ] Tried deleting `node_modules` and reinstalling

---

**Last Updated**: 2025-11-15
**For Issues**: See phase-specific sections in `MIGRATION_GUIDE.md`

