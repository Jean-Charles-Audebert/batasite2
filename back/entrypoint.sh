#!/bin/sh

# Copy initial media files to persistent volume if they don't exist
if [ ! -f /app/uploads/content/photo1.jpeg ]; then
  echo "Copying initial media files..."
  cp -r /app/src/../uploads/* /app/uploads/ 2>/dev/null || true
fi

# Start the application
exec node src/server.js
