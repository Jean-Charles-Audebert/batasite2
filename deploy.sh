#!/bin/bash

# Deployment script for NAS - removes old images and pulls latest

cd /volume1/docker/batasite2

echo "🗑️  Removing old images..."
docker rmi iousco/batasite2:backend-latest iousco/batasite2:frontend-latest 2>/dev/null || true

echo "📥 Pulling latest images..."
docker-compose pull

echo "🔄 Restarting containers..."
docker-compose down
docker-compose up -d

echo "✅ Deployment complete"
docker ps | grep batasite2
