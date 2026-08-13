FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json ./package.json
COPY server/package.json ./server/package.json
RUN npm install --workspace server --include-workspace-root

FROM dependencies AS development
WORKDIR /app/server
COPY server ./
CMD ["npm", "run", "dev"]

FROM node:24-alpine AS production
WORKDIR /app
COPY package.json ./package.json
COPY server/package.json ./server/package.json
RUN npm install --omit=dev --workspace server --include-workspace-root
COPY server ./server
WORKDIR /app/server
RUN mkdir -p data && chown -R node:node /app/server
USER node
CMD ["npm", "start"]
