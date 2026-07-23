# syntax=docker/dockerfile:1.7
# Next 15 (App Router, output: standalone) en Cloud Run. Espejo de apps/lectores (SS).

# ---- deps ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# ---- builder ----
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# content/ vive en la raíz del monorepo, fuera del build context de esta app
# (npm run docker:build usa "." = apps/sitio). Se trae como named build context
# (requiere BuildKit — ya es el default en Docker moderno) en vez de mover el
# contexto principal a la raíz. CONTENT_DIR override evita que lib/landing.ts
# calcule mal la ruta (asume "../../content" relativo a process.cwd(), que
# dentro del container ya no coincide con la profundidad real).
COPY --from=content . ./content
ENV CONTENT_DIR=/app/content
RUN npm run build

# ---- runner ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# content/ también hace falta en runtime, no solo en build: páginas como
# /comunidad combinan Firestore (ISR on-demand, ADR-0028) con content/landing/
# (historia, misión/visión) — Next.js vuelve a ejecutar la lectura de content/
# cada vez que revalida, no solo en el build inicial.
COPY --from=content --chown=nextjs:nodejs . ./content
ENV CONTENT_DIR=/app/content

USER nextjs
EXPOSE 8080

CMD ["node", "server.js"]
