FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=3000
ENV CORS_ORIGINS=http://localhost:4200
ENV MONGODB_URI=mongodb://mongo:27017/finmgmt
ENV DB_NAME=finmgmt

EXPOSE 3000

CMD [ "npm", "run", "buildandstart" ]