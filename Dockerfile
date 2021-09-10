FROM navikt/node-express:14-alpine

WORKDIR /app

#COPY build server node_modules ./
COPY . ./

#WORKDIR /app/server

EXPOSE 8080
ENTRYPOINT ["node", "server/server.js"]