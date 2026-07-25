# Stage 1: Build the static Astro site
FROM docker.io/library/node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests and install
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve with an unprivileged Nginx web server
FROM docker.io/nginxinc/nginx-unprivileged:alpine

# Copy static output to the Nginx HTML directory
COPY --from=builder /app/dist /usr/share/nginx/html

# The unprivileged Nginx image exposes 8080 by default
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
