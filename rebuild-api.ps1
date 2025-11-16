Write-Host "Stopping containers..." -ForegroundColor Yellow
docker-compose down

Write-Host "Rebuilding API image..." -ForegroundColor Yellow
docker build -t cookbook/api:latest ./api

Write-Host "Starting containers..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "Done! Checking API logs..." -ForegroundColor Green
docker logs -f api


