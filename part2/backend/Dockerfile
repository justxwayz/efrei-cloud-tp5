FROM node:20-alpine

WORKDIR /app

COPY package.json .

RUN npm install && npm cache clean --force

COPY src ./src

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "dev"]
