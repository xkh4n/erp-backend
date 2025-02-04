FROM node:22-alpine3.20 as prod-dependencies
WORKDIR /app
COPY package.json ./package.json
RUN npm install --only=production



FROM node:22-alpine3.20 as builder-prod
WORKDIR /app
COPY --from=prod-dependencies /app/node_modules ./node_modules
COPY --from=prod-dependencies /app/package.json ./package.json
COPY src ./src
COPY index.js ./
COPY server.js ./
COPY .env ./.env



FROM node:22-alpine3.20 as prod
WORKDIR /app
COPY --from=builder-prod /app .
EXPOSE 3030
CMD [ "npm","run","start" ]
