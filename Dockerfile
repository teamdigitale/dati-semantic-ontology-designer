FROM docker.io/nginxinc/nginx-unprivileged:alpine3.22-perl AS nginx
FROM docker.io/library/node:24-slim AS node

FROM node AS base

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm install
RUN npm run build

FROM nginx AS webapp
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 8080
USER 1000
CMD ["nginx","-g","daemon off;"]