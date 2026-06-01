# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app

# Copy the workspace manifests first so Docker can cache dependency installs.
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
RUN npm ci

FROM deps AS build
WORKDIR /app

# Copy only the frontend workspace source after dependencies are cached.
COPY frontend ./frontend

# The frontend can be built against an absolute API URL or a reverse-proxied /api path.
ARG VITE_API_URL=/api
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

WORKDIR /app/frontend
RUN npm run build

FROM nginx:1.27-alpine AS production

# This Nginx instance serves the compiled Vite assets and handles SPA routing.
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM deps AS development
WORKDIR /app

# Copy the frontend workspace for local hot-reload development.
COPY frontend ./frontend

EXPOSE 5173
CMD ["npm", "run", "dev", "--workspace", "frontend", "--", "--host", "0.0.0.0", "--port", "5173"]
