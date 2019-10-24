# Use a node alpine image install packages and run the start script
FROM node:12-alpine
WORKDIR /app
EXPOSE 3000
COPY ["package*.json", "/app/"]
ENV NODE_ENV production
RUN npm ci &> /dev/null
COPY src /app/src
RUN chmod +x /app/src/cli.js && ln -s /app/src/cli.js /usr/local/bin/dashund
CMD [ "dashund", "serve" ]
