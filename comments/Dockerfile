# specify the base image
FROM node:alpine

# configure the work directory
WORKDIR /app

# configure of package-json file and other file and install dependencies
COPY package.json ./
RUN npm install
COPY ./ ./

# configure default command
CMD [ "npm","start" ]