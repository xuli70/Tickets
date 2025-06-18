# Guía de Despliegue con Coolify

Esta aplicación React + Vite está configurada para desplegarse fácilmente con Coolify usando Nixpacks.

## Configuración en Coolify

### 1. Crear nueva aplicación

1. En tu panel de Coolify, crea una nueva aplicación
2. Selecciona **GitHub** como fuente
3. Conecta tu repositorio: `https://github.com/xuli70/Tickets`
4. Selecciona la rama: `coolify-deployment`

### 2. Configuración de Build

Coolify detectará automáticamente que es una aplicación Node.js y usará Nixpacks gracias al archivo `nixpacks.toml`.

**Configuraciones importantes:**
- **Build Pack**: Nixpacks (automático)
- **Puerto**: 8080 (configurado en package.json)

### 3. Variables de Entorno

Añade las siguientes variables de entorno en Coolify:

```bash
# Supabase
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=tu_clave_publica_de_stripe

# Puerto (Coolify lo asignará automáticamente)
PORT=8080
```

### 4. Configuración de Red

- **Dominio**: Configura tu dominio personalizado o usa el subdominio proporcionado por Coolify
- **SSL**: Coolify configurará automáticamente SSL con Let's Encrypt

## Estructura del Proyecto

```
Tickets/
├── src/                 # Código fuente de React
├── public/             # Archivos estáticos
├── dist/               # Build de producción (generado)
├── package.json        # Dependencias y scripts
├── vite.config.js      # Configuración de Vite
├── nixpacks.toml       # Configuración de Nixpacks
├── .env.example        # Ejemplo de variables de entorno
└── Dockerfile          # Alternativa si prefieres Docker
```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Previsualiza la build de producción
- `npm run start`: Inicia el servidor de producción (usado por Coolify)

## Proceso de Despliegue

1. **Build**: Nixpacks ejecutará `npm ci --legacy-peer-deps` y luego `npm run build`
2. **Start**: La aplicación se iniciará con `npm run start` que ejecuta `vite preview`
3. **Puerto**: La aplicación escuchará en el puerto 8080 (o el asignado por Coolify)

## Solución de Problemas

### Error de dependencias
Si hay problemas con las dependencias, el flag `--legacy-peer-deps` en `nixpacks.toml` debería resolverlos.

### Puerto no accesible
Asegúrate de que:
- El script `start` usa `--host` para escuchar en todas las interfaces
- El puerto está configurado correctamente en las variables de entorno

### Build fallido
Verifica:
- Que todas las variables de entorno estén configuradas
- Los logs de build en Coolify para errores específicos
- Que la rama `coolify-deployment` esté actualizada

## Alternativa con Docker

Si prefieres usar Docker en lugar de Nixpacks:

1. En Coolify, cambia el Build Pack a **Dockerfile**
2. El archivo `Dockerfile` ya está incluido en el repositorio
3. Coolify usará automáticamente este archivo para construir la imagen

## Mantenimiento

Para actualizar la aplicación:
1. Haz push de los cambios a la rama `coolify-deployment`
2. Coolify detectará los cambios y reconstruirá automáticamente
3. La nueva versión se desplegará sin tiempo de inactividad

## Notas Adicionales

- La aplicación usa Vite en modo preview para servir los archivos estáticos
- Las variables de entorno deben empezar con `VITE_` para ser accesibles en el cliente
- El build está optimizado con code splitting para mejor rendimiento