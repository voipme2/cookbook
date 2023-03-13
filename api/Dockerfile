FROM node:17-alpine
WORKDIR /app
COPY package*.json /app/
COPY ./ /app/
RUN npm install

EXPOSE 3000
ENTRYPOINT [ "npm", "run", "start" ]
