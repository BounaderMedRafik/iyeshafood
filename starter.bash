#!/bin/bash

# Exit on error
set -e

# Install dependencies
echo "Installing dependencies..."
npm install

# Start Vite server (or your server) in background
echo "Starting server..."
npm run server &

# Start Prisma Studio in background
echo "Opening Prisma Studio..."
npx prisma studio &

# Open browser after a short delay
sleep 3
xdg-open http://localhost:5173/ &

# Start Next.js dev server in foreground
echo "Starting Next.js dev server..."
npm run dev
