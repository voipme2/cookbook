FROM node:17-alpine
WORKDIR /app
COPY package*.json /app/
COPY node_modules /app/
RUN npm install
COPY ./ /app/

EXPOSE 3000
ENTRYPOINT [ "npm", "run", "start" ]
