#
# Must run `npm run build` before building
# This is automatically ran as part of the `npm version`
#
FROM robbj/configurable-nginx:1.0.1
COPY dist /usr/share/nginx/html

# Start with a node 10 image with package info
# Installs *all* npm packages and runs build script
# FROM node:10-alpine as builder
# WORKDIR /app
# COPY ["package*.json", "/app/"]
# ENV NODE_ENV=development
# RUN npm ci &> /dev/null
# ENV NODE_ENV=production
# COPY [ ".", "/app/" ]
# RUN npm run build &> /dev/null

# Swaps to nginx and copies the compiled html ready to be serverd
# Uses a configurable nginx which can pass envionment variables to JavaScript
# FROM robbj/configurable-nginx:0.1.0
# COPY --from=builder /app/dist /usr/share/nginx/html
