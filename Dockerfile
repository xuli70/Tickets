# Dockerfile alternativo si prefieres usar Docker en lugar de Nixpacks

FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/vite.config.js ./

# Instalar solo dependencias de producción
RUN npm ci --production --legacy-peer-deps

# Exponer el puerto
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["npm", "run", "start"]