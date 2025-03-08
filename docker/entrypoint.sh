#!/bin/sh
set -e

# Mostrar variables de entorno para depuración
echo "API_BASE_URL: $API_BASE_URL"
# echo "OTHER_ENV: $OTHER_ENV"

# Reemplazar los placeholders en el archivo de configuración de React y generar config.js
envsubst < /usr/share/nginx/html/config.template.js > /usr/share/nginx/html/config.js

# Iniciar Nginx en primer plano
exec nginx -g 'daemon off;'
