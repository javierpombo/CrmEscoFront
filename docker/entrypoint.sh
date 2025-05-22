#!/bin/sh
set -e

# Mostrar variables de entorno para depuración
echo "API_BASE_URL: $API_BASE_URL"
echo "Waiting for backend to be ready..."

# Esperar a que el backend esté disponible
timeout=300
while ! wget -q --spider http://backend/api/health; do
  timeout=$((timeout-1))
  if [ $timeout -eq 0 ]; then
    echo "Backend service did not become available in time"
    exit 1
  fi
  sleep 1
done

echo "Backend is ready!"

# Reemplazar los placeholders en el archivo de configuración de React y generar config.js
envsubst < /usr/share/nginx/html/config.template.js > /usr/share/nginx/html/config.js

# Iniciar Nginx en primer plano
exec nginx -g 'daemon off;'