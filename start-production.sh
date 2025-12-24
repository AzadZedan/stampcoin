#!/bin/bash

# StampCoin Backend Production Start Script

echo "Starting StampCoin Backend..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL is not set"
    exit 1
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "Error: STRIPE_SECRET_KEY is not set"
    exit 1
fi

if [ -z "$SESSION_SECRET" ]; then
    echo "Error: SESSION_SECRET is not set"
    exit 1
fi

echo "Environment variables validated ✓"

# Start the server
echo "Starting server on port ${PORT:-3000}..."
node dist/index.js
