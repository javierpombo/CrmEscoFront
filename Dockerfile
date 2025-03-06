# Stage 1: Build - Usa Node Alpine como base
FROM node:20-alpine AS build
 
# Crear usuario no privilegiado
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
 
# Establecer directorio de trabajo
WORKDIR /app
 
# Copiar archivos de dependencias primero (para aprovechar caché de capas)
COPY package.json package-lock.json ./
 
# Instalar dependencias con configuraciones de seguridad
RUN npm ci --ignore-scripts --no-audit \
&& npm cache clean --force
 
# Copiar código fuente (solo lo necesario para build)
COPY tsconfig.json ./
COPY public ./public
COPY src ./src
 
# Construir la aplicación
RUN npm run build \
&& chown -R appuser:appgroup /app/build
 
# Stage 2: Producción - Usar Nginx Alpine
FROM nginx:alpine AS production
 
# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
 
# Configuraciones de seguridad para nginx
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    chown -R nginx:nginx /var/cache/nginx && \
    # Eliminar archivos innecesarios
    rm -rf /usr/share/nginx/html/* && \
    # Permisos para directorios temporales
    chown -R nginx:nginx /etc/nginx/conf.d
 
# Copiar archivos de build desde la etapa anterior
COPY --from=build --chown=nginx:nginx /app/build /usr/share/nginx/html
 
COPY  ./crm.acqit.crt   /etc/ssl/certs/
 
COPY ./crm.acqit.key  /etc/ssl/private/
 
# Cambiar al usuario no privilegiado
USER nginx
 
# Exponer puerto para HTTPS
EXPOSE 443
 
# Comprobar que nginx está configurado correctamente
HEALTHCHECK --interval=30s --timeout=3s CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1
 
# Iniciar nginx con opciones para que se ejecute en primer plano
CMD ["nginx", "-g", "daemon off;"]