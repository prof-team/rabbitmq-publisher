FROM node:carbon-alpine

# Create app directory
RUN mkdir /app
ADD . /app
WORKDIR /app

RUN rm -r /app/.git
RUN rm /app/.gitignore
RUN rm /app/.env.example
RUN rm /app/docker-compose.yml
RUN rm /app/Dockerfile
RUN rm -f /app/README.md

RUN yarn install

CMD ["node", "/app/src/server.js"]
