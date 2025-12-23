# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app
COPY src ./src

# Copy initial media files dev only
# COPY uploads ./uploads

# Copy entrypoint script
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 5000

# Start server
ENTRYPOINT ["/app/entrypoint.sh"]
