FROM node:lts-alpine as build
WORKDIR /app
COPY package*.json /app/
COPY ./ /app/
RUN npm ci && \
    npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Copy the default nginx.conf provided by tiangolo/node-frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf
