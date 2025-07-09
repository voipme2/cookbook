#!/bin/bash

# Development environment script for The Trusted Palate

set -e

echo "🍳 Starting The Trusted Palate Development Environment..."

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to start development environment
start_dev() {
    echo "🚀 Starting development environment..."
    docker-compose -f docker-compose.dev.yml up --build -d
    
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    echo "✅ Development environment is ready!"
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 API: http://localhost:3001"
    echo "🗄️  Database: localhost:5432"
    echo ""
    echo "📋 Useful commands:"
    echo "  View logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "  Stop services: docker-compose -f docker-compose.dev.yml down"
    echo "  Restart services: docker-compose -f docker-compose.dev.yml restart"
}

# Function to stop development environment
stop_dev() {
    echo "🛑 Stopping development environment..."
    docker-compose -f docker-compose.dev.yml down
    echo "✅ Development environment stopped."
}

# Function to view logs
view_logs() {
    echo "📋 Showing logs..."
    docker-compose -f docker-compose.dev.yml logs -f
}

# Function to restart services
restart_dev() {
    echo "🔄 Restarting development environment..."
    docker-compose -f docker-compose.dev.yml restart
    echo "✅ Development environment restarted."
}

# Function to clean up
clean_dev() {
    echo "🧹 Cleaning up development environment..."
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
    echo "✅ Development environment cleaned up."
}

# Main script logic
case "${1:-start}" in
    start)
        check_docker
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        restart_dev
        ;;
    logs)
        view_logs
        ;;
    clean)
        clean_dev
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|clean}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the development environment (default)"
        echo "  stop    - Stop the development environment"
        echo "  restart - Restart all services"
        echo "  logs    - View logs from all services"
        echo "  clean   - Stop and clean up everything"
        exit 1
        ;;
esac 