FROM node:22

WORKDIR /app

COPY  package*.json ./

RUN npm install

COPY . .

ENV PORT=5000

EXPOSE ${PORT}

CMD ["npm","start"]