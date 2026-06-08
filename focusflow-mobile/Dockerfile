FROM node:18-alpine

WORKDIR /app

# Expo CLI icin global kurulum
RUN npm install -g expo-cli@latest

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 8081 19000 19001 19002

# Expo dev server - tunnel modunda cihazlardan erisilebilir
CMD ["npx", "expo", "start", "--tunnel"]
