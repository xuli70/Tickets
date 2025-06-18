# Dockerfile para Coolify - Versión robusta que maneja el package-lock.json faltante

FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json ./

# Instalar dependencias (usando install que genera package-lock.json)
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Instalar caddy para servir archivos estáticos
RUN apk add --no-cache caddy

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/vite.config.js ./

# Crear Caddyfile para servir la aplicación
RUN echo -e ":${PORT:-8080} {\n\
    root * /app/dist\n\
    file_server\n\
    try_files {path} /index.html\n\
}" > /app/Caddyfile

# Exponer el puerto
EXPOSE 8080

# Comando para iniciar Caddy
CMD ["caddy", "run", "--config", "/app/Caddyfile", "--adapter", "caddyfile"]
