# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app
COPY src ./src

# Copy initial media files
COPY uploads ./uploads

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "src/server.js"]
