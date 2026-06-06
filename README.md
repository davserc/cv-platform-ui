# CV Platform UI

Frontend web de la plataforma de visión por computadora. Provee interfaz para entrenamiento, gestión de modelos e inferencia, consumiendo la API del backend ([cv-cloudgpu-platform](../cv-cloudgpu-platform)).

## Estructura

```
src/
  pages/          Training, Models, Inference, Config
  features/       Lógica del flujo de entrenamiento
  api/client.ts   Cliente HTTP y contratos de API
  context/        Estado global (API Key)
public/           Assets estáticos (logos, sprites)
```

## Requisitos

- Node.js 20+
- npm 10+

## Ejecución local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env.local
# Por defecto apunta a /api/v1 — el proxy de Vite redirige al backend

# 3. Iniciar dev server
npm run dev
# → http://localhost:5173
```

### Proxy de Vite (local)

`vite.config.ts` redirige `/api` al backend. Por defecto apunta al GKE LoadBalancer en producción.
Para desarrollo local con kind, cambiar `target` a `http://localhost:8080` (puerto del port-forward del api-gateway):

```ts
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8080',  // kind local
    // target: 'http://34.45.21.197', // GKE producción
    changeOrigin: true,
  },
},
```

### API Key

No se define en `.env`. Se ingresa en la pantalla **Config** y se guarda en `localStorage` bajo la clave `cv_api_key`.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev server con hot reload |
| `npm run build` | Type-check TypeScript + build Vite |
| `npm run preview` | Servir el build de producción localmente |

## Deploy en producción (Firebase Hosting)

La app se despliega automáticamente a Firebase Hosting vía GitHub Actions al hacer push a `main`.

Para deploy manual:

```bash
# Build de producción (usa VITE_API_BASE_URL del .env.production)
npm run build

# Deploy a Firebase Hosting
npx firebase-tools deploy --only hosting --project cv-platform-fbd07
```

El archivo `.env.production` (no commiteado) debe tener:
```
VITE_API_BASE_URL=http://<IP_GKE_LB>/api/v1
```

Obtener la IP con:
```bash
kubectl get svc api-gateway -n cv-platform
```

> El `api-proxy` (Nginx en Cloud Run) maneja CORS entre Firebase (`cv-platform-fbd07.web.app`) y el GKE api-gateway. Ver [`api-proxy/`](../api-proxy).

## Troubleshooting

| Error | Causa probable | Solución |
|-------|---------------|----------|
| `401/403` | API key incorrecta | Validar en pantalla Config |
| `Failed to fetch` | Backend inaccesible | Verificar `VITE_API_BASE_URL` y que el backend esté corriendo |
| CORS error | Origen no autorizado | Revisar `CORS_ALLOW_ORIGINS` en api-gateway |
| Variables no aplicadas | `.env.local` no recargado | Reiniciar `npm run dev` |

## Estado

Aplicación funcional para entrenamiento, modelos e inferencia, con evolución incremental de UX y observabilidad.
