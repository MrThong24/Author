# Use an official Node.js 17.x runtime as the base image
FROM node:18-alpine
ENV HTTP_PROXY=http://10.39.152.30:3128 \
    HTTPS_PROXY=http://10.39.152.30:3128

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
# Copy the Node.js backend code to the working directory
COPY package*.json /app

# Install dependencies
RUN npm install 

ENV HTTP_PROXY= \
    HTTPS_PROXY=

# Start the Node.js application
CMD npm start
