FROM mcr.microsoft.com/playwright:focal

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .

CMD ["node", "index.js"]
