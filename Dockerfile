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

# Copiar configuración de nginx
COPY settings.conf /etc/nginx/conf.d/default.conf

# Copiar certificados SSL y clave privada
COPY ./crm.acqit.crt /etc/ssl/certs/crm.acqit.crt
COPY ./crm.acqit.key /etc/ssl/private/crm.acqit.key

# Asegurar que el certificado y clave tengan permisos adecuados
RUN chmod 644 /etc/ssl/certs/crm.acqit.crt \
    && chmod 600 /etc/ssl/private/crm.acqit.key \
    && chown nginx:nginx /etc/ssl/certs/crm.acqit.crt \
    && chown nginx:nginx /etc/ssl/private/crm.acqit.key

# Copiar configuración personalizada de nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY settings.conf /etc/nginx/conf.d/default.conf

# Limpiar carpeta default y copiar contenido build
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/build /usr/share/nginx/html

# Configurar permisos para archivos html
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]