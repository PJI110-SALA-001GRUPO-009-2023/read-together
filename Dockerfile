FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./views ./views
COPY ./public ./public
COPY .env .

RUN mkdir dist && \
    npm install && \
    npm run build && \
    rm -rf src/

EXPOSE 8080
CMD node ./dist/index.js