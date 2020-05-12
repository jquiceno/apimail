FROM node:12

WORKDIR /usr/src

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
