# Stage 1: Build
FROM node:20 as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "run", "build:dev" ]

# Stage 2: Serve
FROM nginx:alpine

COPY --from=build /app/dist/fink/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]