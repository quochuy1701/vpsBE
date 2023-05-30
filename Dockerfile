FROM node:16

WORKDIR /usr/src/app

COPY package*.json .

COPY prisma ./prisma/
RUN yarn install

COPY . .

# định nghĩa port private (trong)
EXPOSE 8080

# npm start, node src/index.js 
CMD ["node","index.js"]

# docker build . -t img-node