FROM node:22-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build Next.js
WORKDIR /app/apps/web
RUN pnpm run build

# Install global runners
RUN npm install -g concurrently tsx

# Set working directory back to root to run all servers
WORKDIR /app

# Expose Next.js port
EXPOSE 3000

# Start Next.js AND all MCP Servers
CMD ["npx", "concurrently", "\"pnpm --filter web start\"", "\"npx tsx packages/mcp-library/src/index.ts\"", "\"npx tsx packages/mcp-cafeteria/src/index.ts\"", "\"npx tsx packages/mcp-events/src/index.ts\"", "\"npx tsx packages/mcp-academics/src/index.ts\""]
