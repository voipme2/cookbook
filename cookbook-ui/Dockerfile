FROM node:lts-alpine as build
WORKDIR /app
COPY package*.json /app/
COPY node_modules /app/
RUN npm install
COPY ./ /app/
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Copy the default nginx.conf provided by tiangolo/node-frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf
