# Dockerfile para producción con debugging

FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Construir la aplicación y listar archivos generados
RUN npm run build && \
    echo "=== Contenido de /app después del build ===" && \
    ls -la /app/ && \
    echo "=== Contenido de /app/dist ===" && \
    ls -la /app/dist/ || echo "No existe /app/dist"

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Instalar caddy
RUN apk add --no-cache caddy

# Copiar archivos desde el builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Crear un index.html de respaldo si no existe
RUN if [ ! -f /app/dist/index.html ]; then \
      echo '<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Error: No se encontró dist/index.html</h1><p>El build no generó los archivos esperados.</p></body></html>' > /app/dist/index.html; \
    fi

# Crear Caddyfile mejorado
RUN echo -e ":${PORT:-8080} {\n\
    root * /app/dist\n\
    file_server browse\n\
    try_files {path} /index.html\n\
    encode gzip\n\
    log {\n\
        output stdout\n\
        format console\n\
    }\n\
}" > /app/Caddyfile

# Exponer el puerto
EXPOSE 8080

# Comando para verificar estructura y luego iniciar
CMD echo "=== Estructura de archivos en producción ===" && \
    ls -la /app/ && \
    echo "=== Contenido de /app/dist ===" && \
    ls -la /app/dist/ && \
    echo "=== Iniciando Caddy ===" && \
    caddy run --config /app/Caddyfile --adapter caddyfile
