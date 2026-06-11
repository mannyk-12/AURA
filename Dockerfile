FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
# Install dependencies
RUN pnpm install --frozen-lockfile

# Build Next.js
WORKDIR /app/apps/web
RUN pnpm run build

FROM base AS runner
WORKDIR /app

# Install concurrently and tsx to run all servers
RUN pnpm add -g concurrently tsx

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy Next.js app
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/.env.production ./apps/web/.env.production

# Copy all MCP packages
COPY --from=builder /app/packages ./packages

# Expose Next.js port
EXPOSE 3000

# Start Next.js AND all MCP Servers
CMD ["npx", "concurrently", "\"pnpm --filter web start\"", "\"npx tsx packages/mcp-library/src/index.ts\"", "\"npx tsx packages/mcp-cafeteria/src/index.ts\"", "\"npx tsx packages/mcp-events/src/index.ts\"", "\"npx tsx packages/mcp-academics/src/index.ts\""]
