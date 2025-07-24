#!/bin/bash

# Environment switcher script for HomeIQ
# Usage: ./env-switch.sh [development|production]

ENV=${1:-development}

echo "Switching to $ENV environment..."

# Client environment files
if [ "$ENV" = "production" ]; then
    echo "Setting up production environment..."
    
    # Copy production env files to active .env files
    cp client/.env.production client/.env 2>/dev/null || echo "Warning: client/.env.production not found"
    cp server/.env.production server/.env 2>/dev/null || echo "Warning: server/.env.production not found"
    
    echo "✅ Production environment activated"
    echo "Client API URL: $(grep VITE_API_BASE_URL client/.env 2>/dev/null || echo 'Not configured')"
    echo "Server NODE_ENV: production"
    
elif [ "$ENV" = "development" ]; then
    echo "Setting up development environment..."
    
    # Copy development env files to active .env files
    cp client/.env.development client/.env 2>/dev/null || echo "Warning: client/.env.development not found"
    cp server/.env.development server/.env 2>/dev/null || echo "Warning: server/.env.development not found"
    
    echo "✅ Development environment activated"
    echo "Client API URL: $(grep VITE_API_BASE_URL client/.env 2>/dev/null || echo 'Not configured')"
    echo "Server NODE_ENV: development"
    
else
    echo "❌ Invalid environment. Use 'development' or 'production'"
    echo "Usage: ./env-switch.sh [development|production]"
    exit 1
fi

echo ""
echo "Environment files created:"
echo "- client/.env"
echo "- server/.env"
echo ""
echo "You can now run:"
echo "- npm run dev (for development)"
echo "- npm run dev:prod (for production-like testing)"
echo "- npm run start (for production)"