# Development Setup

## Quick Start (5 minutes)

### 1. Create `.env` file

Create `.env` in project root:
```env
PGUSER=cookbook
PGHOST=localhost
PGPASSWORD=cookbook123
PGDATABASE=cookbook
PGPORT=5432
NODE_ENV=development
PORT=5173
```

### 2. Start Database

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Start Dev Server

```bash
npm run dev
```

Open: http://localhost:5173

### 4. Import Recipes (Optional)

In a new terminal:
```bash
npm run import-recipes
```

Then navigate to http://localhost:5173/recipes to see imported recipes.

---

## Common Commands

```bash
# Start database
docker-compose -f docker-compose.dev.yml up -d

# Stop database
docker-compose -f docker-compose.dev.yml down

# View database logs
docker-compose -f docker-compose.dev.yml logs -f db

# Reset database (delete all data)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d

# Connect to database directly
psql -h localhost -U cookbook -d cookbook

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Import recipes from backup
npm run import-recipes

# Check TypeScript
npm run type-check

# Lint code
npm run lint
npm run lint:fix
```

---

## Project Structure

```
cookbook/
├── app/                    # Remix application
│   ├── routes/            # All route files (16 routes)
│   ├── lib/               # Database queries & utilities
│   ├── components/        # React components
│   ├── types/             # TypeScript types
│   ├── root.tsx           # Root layout
│   └── root.css           # Global styles
├── backups/               # Recipe backup files
├── build/                 # Production build (generated)
├── public/                # Static assets
├── scripts/               # Utility scripts
├── init.sql               # Database schema
├── docker-compose.dev.yml # Development Docker setup
├── package.json
├── tsconfig.json
├── remix.config.js
└── [other config files]
```

---

## Routes

**Recipe Management**:
- `GET /recipes` - List recipes
- `POST /recipes` - Create recipe (via `/recipes/new`)
- `GET /recipes/:id` - View recipe
- `POST /recipes/:id` - Update recipe (via `/recipes/:id/edit`)
- `DELETE /recipes/:id` - Delete recipe (via `/recipes/:id/delete`)
- `GET /recipes/:id/upload` - Upload recipe image
- `GET /api/recipes/search` - Search API
- `GET /print/:id` - Print recipe

**Collection Management**:
- `GET /groups` - List collections
- `POST /groups` - Create collection
- `GET /groups/:id` - View collection
- `POST /groups/:id` - Update collection
- `DELETE /groups/:id` - Delete collection
- `GET /groups/:id/manage` - Manage recipes in collection

**Utilities**:
- `GET /import` - Import recipes hub
- `GET /api/scraper` - Web scraper API (placeholder)

---

## Database

### Connect

```bash
psql -h localhost -U cookbook -d cookbook
```

### Common Queries

```sql
-- View recipe count
SELECT COUNT(*) FROM recipes;

-- View all groups
SELECT * FROM recipe_groups;

-- View recipes in a group
SELECT r.id, r.recipe->>'name' as name 
FROM recipes r
JOIN recipe_group_members m ON r.id = m.recipe_id
WHERE m.group_id = 'your-group-id';
```

---

## Troubleshooting

### Database won't start
```bash
# Check if running
docker ps | grep cookbook-db-dev

# View logs
docker-compose -f docker-compose.dev.yml logs db

# Restart
docker-compose -f docker-compose.dev.yml restart db
```

### Port 5432 in use
```bash
# Find what's using it
lsof -i :5432  # Mac/Linux
netstat -ano | findstr :5432  # Windows

# Or change port in docker-compose.dev.yml
```

### Can't connect to database
```bash
# Make sure .env has localhost (not 127.0.0.1)
# Check Docker Desktop is running
# Wait 10 seconds for database to initialize
```

### Recipes not showing
```bash
# Run import
npm run import-recipes

# Verify in database
psql -h localhost -U cookbook -d cookbook
SELECT COUNT(*) FROM recipes;
```

---

## Development Workflow

1. **Start**: `docker-compose -f docker-compose.dev.yml up -d`
2. **Dev**: `npm run dev`
3. **Code**: Edit files in `/app/routes/`, `/app/components/`, etc.
4. **Hot Reload**: Changes auto-apply (Remix dev server)
5. **Stop**: `Ctrl+C` in terminal, then `docker-compose down`

---

## Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `PGUSER` | `cookbook` | Database user |
| `PGHOST` | `localhost` | Database host |
| `PGPASSWORD` | `cookbook123` | Database password |
| `PGDATABASE` | `cookbook` | Database name |
| `PGPORT` | `5432` | Database port |
| `NODE_ENV` | `development` | Node environment |
| `PORT` | `5173` | Dev server port |

---

## Recipe Data

Recipe backups available in `/backups/`:
- `recipes.json` - 358+ recipes
- `newrecipes.json` - Additional recipes
- `recipes.txt` - Text format

Import with: `npm run import-recipes`

---

## Technologies

- **Framework**: Remix (React + Node.js)
- **Database**: PostgreSQL 14
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Package Manager**: npm

---

## Resources

- [Remix Documentation](https://remix.run/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
