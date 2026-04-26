FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

COPY start.sh .
RUN chmod +x start.sh

EXPOSE 3000

CMD ["sh", "start.sh"]