FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
COPY server/package.json ./server/package.json
RUN npm ci --workspace server --include-workspace-root

FROM dependencies AS development
WORKDIR /app/server
COPY server ./
CMD ["npm", "run", "dev"]

FROM node:24-alpine AS production
WORKDIR /app
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
COPY server/package.json ./server/package.json
RUN npm ci --omit=dev --workspace server --include-workspace-root
COPY server ./server
RUN mkdir -p /app/data && chown -R node:node /app
WORKDIR /app/server
USER node
CMD ["npm", "start"]
