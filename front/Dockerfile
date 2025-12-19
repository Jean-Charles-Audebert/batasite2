# Frontend Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app (including public folder)
COPY . .

# Build (vite will automatically include public folder in dist)
RUN npm run build

# Serve with nginx
FROM nginx:alpine

# Copy built dist folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy public files to be served at root (in case some are not in dist)
COPY --from=build /app/public/* /usr/share/nginx/html/ 2>/dev/null || true

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
