FROM node:7

RUN mkdir /src

WORKDIR /src
ADD package.json /src/package.json
RUN npm install

CMD npm start
