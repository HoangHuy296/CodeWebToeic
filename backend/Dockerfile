# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app

# Install workspace dependencies once so both dev and build stages can reuse them.
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
RUN npm ci

FROM deps AS build
WORKDIR /app

# Copy only the backend workspace before compiling TypeScript.
COPY backend ./backend

WORKDIR /app/backend
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies for the workspace using the existing monorepo lockfile.
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
RUN npm ci --omit=dev && npm cache clean --force

# Copy the compiled backend and package metadata into the runtime image.
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/package.json ./backend/package.json

WORKDIR /app/backend
EXPOSE 5000
CMD ["node", "dist/server.js"]

FROM deps AS development
WORKDIR /app

# Copy the backend workspace so tsx watch can run inside Docker.
COPY backend ./backend

WORKDIR /app/backend
EXPOSE 5000
CMD ["npm", "run", "dev"]
