FROM node:22-alpine3.20

WORKDIR /app

COPY package.json ./

RUN npm install

COPY src/ ./src

COPY .env ./

COPY server.js ./

COPY index.js ./

EXPOSE 3000

CMD ["npm", "run", "dev"]