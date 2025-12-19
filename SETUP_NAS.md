# Setup Instructions for NAS Deployment

## 1. Create directory structure on NAS

```bash
ssh jc1932@jc1932.synology.me

# Create the base directory
mkdir -p /volume1/docker/batasite2/back/uploads/content

# Set permissions
chmod 755 /volume1/docker/batasite2/back/uploads/content
```

## 2. Copy initial media files from local to NAS

**From your Windows machine:**

```bash
scp -r c:\Workspaces\Perso\batasite2\back\uploads\content/* jc1932@jc1932.synology.me:/volume1/docker/batasite2/back/uploads/content/
```

**Verify they were copied:**

```bash
ssh jc1932@jc1932.synology.me
ls -la /volume1/docker/batasite2/back/uploads/content/
```

You should see:
- event1.jpg
- event2.jpg
- event3.jpg
- header.svg
- logo.gif
- photo1.jpeg
- photo2.jpg
- photo3.jpg
- photo4.jpg
- photo5.jpg
- photo6.png

## 3. Ensure .env exists on NAS

Create `/volume1/docker/batasite2/.env` with the production configuration (from root `.env` file)

## 4. Deploy Docker containers

```bash
cd /volume1/docker/batasite2
docker-compose pull
docker-compose down
docker-compose up -d

# Verify containers are running
docker ps
```

## 5. Test

```bash
# Check backend is serving files
curl -I http://localhost:5000/uploads/content/photo1.jpeg

# Check frontend can reach them
curl -I http://localhost:5180/uploads/content/photo1.jpeg

# Check via HTTPS
curl -k https://batasite2.jc1932.synology.me/uploads/content/photo1.jpeg
```

## Important Notes

- **Do NOT copy uploads into the Docker image** - they are user-modifiable
- The volume mount `/volume1/docker/batasite2/back/uploads:/app/uploads` makes NAS directory available to container
- Files uploaded via the admin UI will be saved to the persistent volume
- The database stores just the filename, not the full path
