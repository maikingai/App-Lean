FROM node:18-alpine

WORKDIR /usr/src/app

# install dependencies
COPY backend/package*.json ./
RUN npm ci --production

# copy source
COPY backend/ ./

ENV NODE_ENV=production

# expose port used by backend
EXPOSE 3000

CMD ["node", "src/index.js"]