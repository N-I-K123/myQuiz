# ZMIANA: Z 18 na 22-alpine
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Pamiętaj o --host dla dockera
CMD ["npm", "run", "dev", "--", "--host"]