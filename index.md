# Tickets

Sistema de tickets migrado desde Google Drive.

## Estructura del proyecto

- `src/` - Código fuente
  - `components/` - Componentes reutilizables
    - `admin/` - Componentes de administración
    - `ui/` - Componentes de interfaz de usuario
  - `hooks/` - Custom hooks (vacío)
  - `lib/` - Librerías y utilidades (vacío)
- `public/` - Archivos públicos estáticos (vacío)
- `plugins/` - Plugins del sistema
  - `visual-editor/` - Editor visual (vacío)

## Estado de migración

✅ Estructura de carpetas creada
✅ Subcarpetas de componentes agregadas (admin, ui)
⏳ Pendiente: migración de archivos específicos desde Google Drive

## Carpetas de Google Drive migradas

La estructura se ha migrado desde Google Drive manteniendo la jerarquía original:
- Carpeta principal: `Tickets`
- Documento: `index` (vacío) → convertido a `index.md`
- Todas las subcarpetas han sido recreadas en GitHub

## Próximos pasos

1. Agregar archivos de código específicos según se vayan creando
2. Documentar APIs y componentes
3. Configurar sistema de build/deploy
