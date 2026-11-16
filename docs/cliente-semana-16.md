# Modulo Cliente: avance hasta la semana 16

## Rama

`cliente`

## Alcance implementado

| Semana | Actividad | Implementacion |
| --- | --- | --- |
| S7-S8 | Servicios y endpoints del Cliente | Consulta de productos, creacion de pedidos e historial por cliente. |
| S9 | Autenticacion y rutas protegidas | `AuthContext`, `RutaProtegida` y acceso exclusivo para el rol `cliente`. |
| S10-S12 | Estructura frontend | Dashboard Cliente con catalogo, filtros, carrito e historial de pedidos. |
| S13-S15 | Integracion API y Bootstrap | Adaptador `clienteApi`, Bootstrap Icons, estados de carga, error y disponibilidad. |
| S15 | Navbar, footer y flujo completo | Navegacion entre catalogo y pedidos, logout, creacion y cancelacion de pedidos. |
| S16 | Documentacion y exposicion | Evidencias de endpoints, rama y flujo funcional del Cliente. |

## Flujo funcional

1. El cliente inicia sesion desde `/login`.
2. La ruta protegida redirige al dashboard `/cliente`.
3. El catalogo se obtiene desde `GET /api/productos`.
4. El cliente filtra por categoria y agrega productos al carrito.
5. El cliente crea un pedido mediante `POST /api/pedidos`.
6. El pedido aparece en `Mis pedidos` con su codigo, detalle, total y estado.
7. El cliente puede cancelar pedidos que aun esten pendientes.
8. El vendedor puede atender el pedido desde su modulo.

## Endpoints utilizados

```text
GET   http://localhost:3001/api/productos
GET   http://localhost:3001/api/pedidos/cliente/:clienteId
POST  http://localhost:3001/api/pedidos
PATCH http://localhost:3001/api/pedidos/:codigo/cancelar
```

## Comprobaciones realizadas

```bash
npm run build
node --check backend/server.js
```

Tambien se verificaron respuestas `200` para el catalogo y el historial de pedidos.

## Ejecucion

Terminal 1, desde la raiz:

```bash
npm run dev
```

Terminal 2:

```bash
node backend/server.js
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:3001`
