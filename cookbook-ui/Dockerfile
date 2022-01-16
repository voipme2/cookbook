FROM node:lts-alpine as build
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY ./ /app/
RUN npm run build

FROM nginx:alpine
COPY ./src /usr/share/nginx/html

# Copy the default nginx.conf provided by tiangolo/node-frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf
