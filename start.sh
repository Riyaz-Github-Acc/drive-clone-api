#!/bin/sh
echo "Running migrations..."
npx drizzle-kit push
echo "Starting app..."
node dist/main.js
