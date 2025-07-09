# Development Environment Setup

This guide will help you set up a robust development environment for The Trusted Palate.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Git](https://git-scm.com/) for version control

## Quick Start

### Windows (PowerShell)
```powershell
# Start the development environment
.\dev.bat

# Or with specific commands
.\dev.bat start    # Start services
.\dev.bat stop     # Stop services
.\dev.bat restart  # Restart services
.\dev.bat logs     # View logs
.\dev.bat clean    # Clean up everything
```

### Linux/macOS
```bash
# Make the script executable (first time only)
chmod +x dev.sh

# Start the development environment
./dev.sh

# Or with specific commands
./dev.sh start    # Start services
./dev.sh stop     # Stop services
./dev.sh restart  # Restart services
./dev.sh logs     # View logs
./dev.sh clean    # Clean up everything
```

## What Gets Started

The development environment includes:

- **Frontend**: Next.js 15+ app running on http://localhost:3000
- **Backend API**: Express.js API running on http://localhost:3001
- **Database**: PostgreSQL 15 running on localhost:5432

## Services

### Frontend (Next.js)
- **URL**: http://localhost:3000
- **Hot Reload**: Enabled
- **Environment**: Development mode with Tailwind CSS

### Backend API (Express.js)
- **URL**: http://localhost:3001
- **API Endpoints**: http://localhost:3001/api/*
- **Hot Reload**: Enabled with ts-node-dev
- **Database**: Connected to PostgreSQL

### Database (PostgreSQL)
- **Host**: localhost
- **Port**: 5432
- **Database**: cookbook
- **Username**: cookbook
- **Password**: cookbook123

## Development Workflow

1. **Start the environment**: Run `.\dev.bat` (Windows) or `./dev.sh` (Linux/macOS)
2. **Make changes**: Edit files in your IDE - changes will auto-reload
3. **View logs**: Run `.\dev.bat logs` to see real-time logs
4. **Stop when done**: Run `.\dev.bat stop` to shut down services

## Useful Commands

### Docker Compose Commands
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build -d

# View running containers
docker-compose -f docker-compose.dev.yml ps
```

### Database Commands
```bash
# Connect to database
docker exec -it cookbook-db-dev psql -U cookbook -d cookbook

# View database logs
docker logs cookbook-db-dev
```

### API Commands
```bash
# View API logs
docker logs cookbook-api-dev

# Restart API only
docker-compose -f docker-compose.dev.yml restart api
```

### Frontend Commands
```bash
# View frontend logs
docker logs cookbook-frontend-dev

# Restart frontend only
docker-compose -f docker-compose.dev.yml restart frontend
```

## Troubleshooting

### Services won't start
1. Make sure Docker Desktop is running
2. Check if ports 3000, 3001, and 5432 are available
3. Run `.\dev.bat clean` to clean up and try again

### Database connection issues
1. Wait for the database to fully start (health check)
2. Check database logs: `docker logs cookbook-db-dev`
3. Verify environment variables in docker-compose.dev.yml

### Frontend not loading
1. Check if the API is running: http://localhost:3001/api
2. View frontend logs: `docker logs cookbook-frontend-dev`
3. Check browser console for errors

### API errors
1. Check API logs: `docker logs cookbook-api-dev`
2. Verify database connection
3. Check if all dependencies are installed

## File Structure

```
cookbook/
├── docker-compose.dev.yml    # Development environment
├── dev.bat                   # Windows development script
├── dev.sh                    # Linux/macOS development script
├── api/
│   ├── Dockerfile.dev        # API development Dockerfile
│   └── init.sql             # Database initialization
├── frontend/
│   └── Dockerfile.dev        # Frontend development Dockerfile
└── README.md
```

## Environment Variables

The development environment uses these environment variables:

- `NODE_ENV=development`
- `PORT=3001` (API)
- `PGUSER=cookbook`
- `PGHOST=db`
- `PGPASSWORD=cookbook123`
- `PGDATABASE=cookbook`
- `PGPORT=5432`

## Next Steps

1. Start the development environment
2. Visit http://localhost:3000 to see the app
3. Test the API at http://localhost:3001/api
4. Start developing!

For production deployment, use the main `docker-compose.yml` file. 