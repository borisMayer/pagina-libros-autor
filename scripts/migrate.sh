#!/bin/sh
# Prisma migrations require a direct (non-pooled) connection.
# Strips -pooler from the hostname if present.
if [ -n "$DIRECT_URL" ]; then
  MIGRATION_URL=$(echo "$DIRECT_URL" | sed 's/-pooler\././g')
  echo "Running migrations with direct connection..."
  DATABASE_URL="$MIGRATION_URL" npx prisma migrate deploy
elif [ -n "$DATABASE_URL" ]; then
  MIGRATION_URL=$(echo "$DATABASE_URL" | sed 's/-pooler\././g' | sed 's/pgbouncer=true//g' | sed 's/&&//g')
  echo "Running migrations (stripped pooler from DATABASE_URL)..."
  DATABASE_URL="$MIGRATION_URL" npx prisma migrate deploy
fi
