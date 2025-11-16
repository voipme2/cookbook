#!/bin/bash

echo "Stopping containers..."
docker-compose down

echo "Rebuilding API image..."
docker build -t cookbook/api:latest ./api

echo "Starting containers..."
docker-compose up -d

echo "Done! Checking API logs..."
docker logs -f api


