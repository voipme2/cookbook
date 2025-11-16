# Create .env file for development if it doesn't exist
if (!(Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Green
    
    $envContent = @"
# PostgreSQL Configuration
PGUSER=cookbook
PGHOST=localhost
PGPASSWORD=cookbook123
PGDATABASE=cookbook
PGPORT=5432

# Application
NODE_ENV=development
PORT=5173
"@
    
    Set-Content -Path .env -Value $envContent
    Write-Host "✓ .env file created" -ForegroundColor Green
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start database: docker-compose -f docker-compose.dev.yml up -d"
Write-Host "2. Run dev server: npm run dev"
Write-Host "3. Open: http://localhost:5173"

