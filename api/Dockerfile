FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy workspace descriptors
COPY package.json pnpm-workspace.yaml ./
COPY api/package.json ./api/
COPY sdk/package.json ./sdk/
COPY pipeline/package.json ./pipeline/
COPY demo/sandbox-career/package.json ./demo/sandbox-career/
COPY demo/sandbox-player/package.json ./demo/sandbox-player/
COPY module/package.json ./module/

# Install dependencies
RUN pnpm install

# Copy application source & contracts
COPY api ./api
COPY contracts ./contracts
COPY docs ./docs

WORKDIR /app/api
RUN pnpm db:generate

ENV PORT=4010
ENV NODE_ENV=development
ENV STORE=memory

EXPOSE 4010

CMD ["pnpm", "start"]
