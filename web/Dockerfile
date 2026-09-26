# Build context: repository root (the app bundles fixtures/feature-flags.json).
FROM node:22-alpine
WORKDIR /srv/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ .
COPY fixtures/ /srv/fixtures/
# Optional. Unset, the app calls port 8000 on the host that served the page,
# which also works inside the native apps' policies webview.
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build
EXPOSE 5173
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
