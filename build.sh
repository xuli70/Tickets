# build.sh
#!/bin/bash
set -e

echo "🚀 Iniciando build de la aplicación..."

# Limpiar cache y archivos anteriores
echo "🧹 Limpiando archivos anteriores..."
rm -rf node_modules package-lock.json

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --legacy-peer-deps

# Construir la aplicación
echo "🔨 Construyendo la aplicación..."
npm run build

echo "✅ Build completado exitosamente!"
