#!/bin/bash
set -e

echo "🔍 Verificando archivos necesarios..."

# Lista de archivos críticos que deben existir
REQUIRED_FILES=(
  "src/hooks/useAppData.js"
  "src/lib/supabase.js"
  "src/lib/utils.js"
)

# Verificar cada archivo
for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  Archivo faltante: $file"
    
    # Crear archivos faltantes básicos si es necesario
    case "$file" in
      "src/lib/utils.js")
        mkdir -p src/lib
        echo 'import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}' > "$file"
        echo "✅ Creado: $file"
        ;;
    esac
  else
    echo "✅ Existe: $file"
  fi
done

echo "📦 Instalando dependencias..."
npm install --legacy-peer-deps

echo "🔨 Construyendo aplicación..."
npm run build

echo "✅ Build completado!"
