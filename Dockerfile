# --- Stage 1: compile the app ---
FROM node:24-slim AS build
RUN npm install -g pnpm@11
WORKDIR /app

# The dependency files go first, so Docker reuses this layer while they do not change.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Vite writes this URL into the code while building, so it is a build argument, not a runtime
# variable. Without it the app would silently talk to localhost, so the build fails instead.
ARG VITE_API_URL
RUN test -n "$VITE_API_URL" || (echo "ERROR: the VITE_API_URL build argument is required" >&2 && exit 1)
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

# --- Stage 2: serve the static files with nginx (it does not run as root) ---
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
