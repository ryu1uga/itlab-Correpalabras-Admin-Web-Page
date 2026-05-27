# --- Etapa 1: Construcción (Se mantiene igual) ---
FROM node:23.11.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Etapa 2: Servidor de producción listo para OpenShift ---
# Usamos la imagen sin privilegios oficial de Nginx (basada en Alpine)
FROM nginxinc/nginx-unprivileged:alpine

# Copiamos los archivos estáticos generados por React
COPY --from=builder /app/build /usr/share/nginx/html

# Copiamos tu configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto (esta imagen ya usa el 8080 por defecto por dentro)
EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]