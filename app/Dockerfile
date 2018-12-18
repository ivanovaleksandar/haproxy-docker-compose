FROM node:8-alpine

ADD package.json /app/
WORKDIR /app
RUN npm install

ADD . /app

EXPOSE  3000

CMD [ "node", "index.js" ]
