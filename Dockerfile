ARG NODE_DEV_IMAGE=europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:26-dev
ARG NODE_RUNTIME_IMAGE=europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:26-slim

FROM ${NODE_DEV_IMAGE} AS builder
WORKDIR /app
ENV CI=true

COPY --chown=node:node package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
# Install all dependencies (including devDependencies) on glibc so native modules work
RUN corepack pnpm install --frozen-lockfile
COPY --chown=node:node . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack pnpm test && pnpm build

# Production image, copy all the files and run next
FROM ${NODE_RUNTIME_IMAGE} AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder  /app/.next/standalone ./
COPY --from=builder  /app/.next/static ./.next/static
COPY  public ./public

EXPOSE 3000

#ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]