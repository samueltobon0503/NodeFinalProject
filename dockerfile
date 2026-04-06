FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev  # Instalamos solo lo necesario para producción

COPY . .

EXPOSE 80

CMD ["npm", "start"]