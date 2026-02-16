# ZMIANA: Z 18 na 22-alpine
FROM node:22-alpine

# Instalujemy OpenSSL (wymagane przez Prismę w Alpine)
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generujemy klienta Prismy w środowisku Linuxowym
RUN npx prisma generate

COPY . .

EXPOSE 8080

CMD ["npm", "start"]