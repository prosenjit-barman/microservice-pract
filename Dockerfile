FROM node:16-alpine
WORKDIR /app
COPY package.json /app/
RUN npm install
EXPOSE 3000
COPY . /app/
CMD npm run dev