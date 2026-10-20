# Modulo Cliente: entregable hasta la semana 6

## Rama

`cliente-semana-6`

## Alcance segun el cronograma

### S1-S2: Planificacion y requerimientos

Se definieron los requerimientos del modulo de consulta de catalogo:

- consultar productos disponibles;
- mostrar nombre, precio, categoria y stock;
- organizar el catalogo por categorias;
- informar cuando un producto no esta disponible.

### S2-S3: Diseno de datos y UI/UX

Se utilizo la estructura de Producto con estos campos:

- `id`
- `nombre`
- `precio`
- `stock`
- `categoria`

La interfaz del catalogo incluye filtros por categoria y tarjetas con la informacion principal de cada producto.

### S3: Configuracion de entorno

Se configuro el backend Express del modulo Cliente y la comunicacion entre frontend y backend. El backend se ejecuta en el puerto `3002` para evitar conflicto con otros modulos.

### S4-S6: Backend, modelos y repositorios

Se reutilizo la informacion de productos para lectura y se implemento la consulta del catalogo mediante la API.

### S6: Backend, servicios y endpoints

Endpoint principal del modulo:

```text
GET http://localhost:3002/api/productos
```

Tambien se dispone de:

```text
GET http://localhost:3002/api/status
```

Respuesta esperada:

```json
{
  "estado": "ok",
  "modulo": "cliente"
}
```

## Evidencias para la presentacion

1. Captura de la rama:

```bash
git branch
git log --oneline --decorate -3
```

2. Captura de la pantalla del catalogo.
3. Captura o respuesta del endpoint `GET /api/productos`.
4. Commits de la rama `cliente-semana-6`.

## Comandos de ejecucion

Desde la raiz del proyecto:

```bash
npm run dev
```

En otra terminal:

```bash
cd backend
node server.js
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:3002`
