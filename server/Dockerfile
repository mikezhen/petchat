# Use official lightweight Node.js 16 image
# https://hub.docker.com/_/node
FROM node:16-alpine

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy app dependency manifests into image
COPY package*.json ./

# Install production dependencies
RUN npm ci --production

# Copy build code into the image
COPY dist ./dist

# Run the web service
EXPOSE 8080
CMD [ "npm", "run", "start:prod" ]