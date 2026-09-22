# API del modulo Cliente

## Endpoint de estado

```http
GET /api/status
```

Confirma que el backend esta activo y corresponde al modulo Cliente.

## Endpoint del catalogo

```http
GET /api/productos
```

Devuelve la lista de productos disponibles para que el frontend la muestre.

## Ejemplo de respuesta

```json
[
  {
    "id": 1,
    "nombre": "Café americano",
    "precio": 5.5,
    "stock": 20,
    "categoria": "Bebidas"
  }
]
```

## Evidencia de prueba

Backend local:

```text
http://localhost:3002/api/status
http://localhost:3002/api/productos
```

La respuesta HTTP esperada del endpoint de estado es `200 OK` y contiene `modulo: cliente`.
