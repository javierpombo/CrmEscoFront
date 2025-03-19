# Stage 1: Build React app
FROM node:20-alpine AS build

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit && npm cache clean --force
COPY . ./
RUN npm run build

# Cambiar permisos a usuario no privilegiado (opcional)
RUN chown -R appuser:appgroup /app/build

# Stage 2: Nginx para producción
FROM nginx:alpine AS production

# Instalar envsubst (gettext) para reemplazar variables en config.template.js
RUN apk update && apk add --no-cache gettext

# Copiar configuración de nginx
COPY settings.conf /etc/nginx/conf.d/default.conf

# Copiar certificados SSL y clave privada
COPY ./crm.davalores.crt /etc/ssl/certs/crm.davalores.crt
COPY ./crm.davalores.key /etc/ssl/private/crm.davalores.key

# Asegurar que el certificado y clave tengan permisos adecuados
RUN chmod 644 /etc/ssl/certs/crm.davalores.crt \
    && chmod 600 /etc/ssl/private/crm.davalores.key \
    && chown nginx:nginx /etc/ssl/certs/crm.davalores.crt \
    && chown nginx:nginx /etc/ssl/private/crm.davalores.key

# Copiar configuración personalizada de nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY settings.conf /etc/nginx/conf.d/default.conf

# Limpiar carpeta default y copiar contenido build
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/build /usr/share/nginx/html

# ───────────────────────────────────────────────────────────────
# AGREGADOS PARA INYECTAR VARIABLES DE ENTORNO EN LA APP (React)
# Copiar el archivo de plantilla para la configuración de la app React
COPY docker/config.template.js /usr/share/nginx/html/config.template.js

# Copiar el script de entrypoint que realizará la inyección de variables y lanzará Nginx
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
# ───────────────────────────────────────────────────────────────

# Configurar permisos para archivos html
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx

EXPOSE 80 443

# Usar el entrypoint para inyectar variables y arrancar Nginx
CMD ["/entrypoint.sh"]
