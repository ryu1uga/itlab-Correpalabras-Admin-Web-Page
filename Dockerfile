# --- Etapa 1: Construcción ---
FROM node:23.11.0-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código y generamos el build de producción
COPY . .
RUN npm run build

# --- Etapa 2: Servidor de producción (Nginx) ---
FROM nginx:alpine

# Copiamos los archivos estáticos generados por React a la ruta de Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copiamos una configuración personalizada de Nginx para OpenShift
COPY nginx.conf /etc/nginx/conf.d/default.conf

# OpenShift expone puertos superiores al 1024 para usuarios no root (usaremos el 8080)
EXPOSE 8080

# Dar permisos necesarios en los directorios de Nginx para que corra sin root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Cambiar al usuario no privilegiado de Nginx
USER 101

CMD ["nginx", "-g", "daemon off;"]