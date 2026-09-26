# Build context: repository root (the app bundles fixtures/feature-flags.json).
FROM node:22-alpine
WORKDIR /srv/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ .
COPY fixtures/ /srv/fixtures/
# The browser calls the API directly, so this is the host-facing URL.
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build
EXPOSE 5173
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
