#FROM node:18-alpine AS deps
#WORKDIR /app
#
#COPY package.json yarn.lock* ./
#RUN yarn --frozen-lockfile

# Rebuild the source code only when needed
#FROM node:18-alpine AS builder
#WORKDIR /app
#COPY --from=deps /app/node_modules ./node_modules
#COPY . .
#
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
#ENV NEXT_TELEMETRY_DISABLED 1
#
#RUN yarn build

FROM node:18-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
#ENV NODE_ENV production

# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

# You only need to copy next.config.js if you are NOT using the default configuration
#COPY --from=builder /app/next.config.js ./
#COPY --from=builder /app/public ./public
#COPY --from=builder /app/package.json ./package.json

COPY public ./public
COPY next.config.js .
COPY package.json ./package.json

# Automatically leverage output traces to reduce image size 
# https://nextjs.org/docs/advanced-features/output-file-tracing
#COPY --from=builder /app/.next/standalone ./
#COPY --from=builder /app/.next/static ./.next/static
COPY .next/standalone ./
COPY .next/static ./.next/static

#COPY .next .next
#COPY node_modules node_modules
#COPY .next/static ./.next/static


EXPOSE 3000
#CMD ["yarn", "start"]
CMD ["node", "server.js"]