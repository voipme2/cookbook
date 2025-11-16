#!/bin/bash

# Create .env file for development if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# PostgreSQL Configuration
PGUSER=cookbook
PGHOST=localhost
PGPASSWORD=cookbook123
PGDATABASE=cookbook
PGPORT=5432

# Application
NODE_ENV=development
PORT=5173
EOF
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "Next steps:"
echo "1. Start database: docker-compose -f docker-compose.dev.yml up -d"
echo "2. Run dev server: npm run dev"
echo "3. Open: http://localhost:5173"

