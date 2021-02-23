FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
COPY . .
#RUN npm install pm2 -g

EXPOSE 5000
CMD ["node","--experimental-worker", "server.js"]
