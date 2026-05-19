# CV Platform UI

Frontend web de la plataforma de visión por computadora. Provee interfaz para entrenamiento, gestión de modelos e inferencia, consumiendo la API del backend.

## Estructura
- `src/pages/` pantallas principales (`Training`, `Models`, `Inference`, `Config`)
- `src/features/training/` lógica y componentes del flujo de entrenamiento
- `src/api/client.ts` cliente HTTP y contratos de requests/responses
- `src/context/` estado global (API Key)
- `public/` assets estáticos

## Requisitos
- Node.js 20+
- npm 10+
- Backend disponible (por defecto en `/api/v1`)

## Uso rápido (local)
1. Instalar dependencias:
   - `npm install`
2. Crear entorno local:
   - `cp .env.example .env.local`
3. Ejecutar en desarrollo:
   - `npm run dev`
4. Abrir la URL de Vite (normalmente `http://localhost:5173`)

Variables de entorno (`.env.local`):
- `VITE_API_BASE_URL` (sin slash final)
  - Desarrollo con proxy: `/api/v1`
  - Staging/Prod: `https://<host>/api/v1`

API Key:
- No se define en `.env`.
- Se carga en la pantalla `Config` y se guarda en `localStorage` (`cv_api_key`).
- Sin API key, las rutas funcionales requieren configuración previa.

## Scripts
- `npm run dev` desarrollo con hot reload
- `npm run build` chequeo TypeScript + build de Vite
- `npm run preview` servir build local

## Integración con backend
- Endpoints esperados bajo la base configurada en `VITE_API_BASE_URL`.
- Para entornos sin proxy local, el backend debe habilitar CORS para el origen del frontend.

## Troubleshooting
- `401/403`: validar API key en `Config` y credencial backend.
- `Failed to fetch`: verificar backend activo y `VITE_API_BASE_URL`.
- Error CORS: revisar `CORS_ALLOW_ORIGINS` del backend.
- Cambios en `.env.local`: reiniciar `npm run dev`.

## Estado
Aplicación funcional para entrenamiento, modelos e inferencia, con evolución incremental de UX y observabilidad.
