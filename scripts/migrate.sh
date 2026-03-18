#!/bin/sh
# Prisma migrations require a direct (non-pooled) connection.
# Use DIRECT_URL (no pgbouncer) to avoid advisory lock timeout.
if [ -n "$DIRECT_URL" ]; then
  echo "Running migrations with DIRECT_URL..."
  DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy
else
  echo "Running migrations with DATABASE_URL..."
  npx prisma migrate deploy
fi
