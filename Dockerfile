FROM node:7

RUN npm install supervisor -g

RUN mkdir /src

WORKDIR /src
ADD package.json /src/package.json
RUN npm install

CMD supervisor -w app app/app.js
