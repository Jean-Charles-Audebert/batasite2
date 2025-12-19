# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app
COPY src ./src

# Copy uploads
COPY uploads ./uploads

# Expose port
EXPOSE 5000


RUN mkdir -p /app/uploads/content

# Start server
CMD ["node", "src/server.js"]
