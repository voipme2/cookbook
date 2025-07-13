# Cookbook Application

A full-stack recipe management application built with Next.js, Express, and PostgreSQL.

## Features

- **Recipe Management**: Create, edit, view, and delete recipes
- **Recipe Groups**: Organize recipes into custom groups
- **Search**: Search recipes by name, description, ingredients, or steps
- **Image Upload**: Upload and manage recipe images
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Print Support**: Print-friendly recipe views

## Recipe URL Handling

Recipes are accessed using their slugified, lowercase IDs:

- Recipe name: "Pancakes" → URL: `/view/pancakes`
- Recipe name: "Alabama White Sauce" → URL: `/view/alabama-white-sauce`

Recipe IDs are automatically generated from the recipe name when creating or updating recipes.

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Quick Start

1. Clone the repository
2. Run the development environment:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```
3. Access the application at `http://localhost:3000`

### Production Deployment

1. Build the Docker images:
   ```bash
   docker-compose build
   ```
2. Start the production environment:
   ```bash
   docker-compose up -d
   ```
3. Access the application at `http://localhost:8000`

## API Endpoints

### Recipes
- `GET /api/recipes` - List all recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `POST /api/recipes` - Create new recipe
- `POST /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

### Search
- `GET /api/search?query=...` - Search recipes
- `POST /api/search` - Search with filters

### Groups
- `GET /api/groups` - List all groups
- `GET /api/groups/:id` - Get group details
- `POST /api/groups` - Create new group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

## Database Maintenance

The application includes scripts for database maintenance:

```bash
# Import recipes from backup
npm run import-recipes

# Migrate production database to new schema
npm run migrate-production
```

## Production Migration

If you need to update a production database to use the new consistent recipe ID schema:

```bash
npm run migrate-production
```

This will:
1. Create a backup of all recipes
2. Update all recipe IDs to be slugified, lowercase versions of their names
3. Remove redundant `id` fields from recipe JSON data
4. Handle any conflicts by appending numbers to duplicate IDs

## License

This project is licensed under the MIT License.
