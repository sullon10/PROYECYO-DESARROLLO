# Requisitos, alcance y acuerdos de planificacion

## Modulo Cliente - CafeteriaWeb

**Responsable:** Cliente
**Periodo:** Semanas 1 a 6
**Alcance principal:** Consulta del catalogo de productos

## 1. Objetivo

Permitir que el usuario cliente consulte de forma clara y ordenada los productos disponibles de la cafeteria desde una interfaz web conectada al backend.

## 2. Requisitos funcionales

| ID | Requisito funcional |
| --- | --- |
| RF-CLI-01 | El sistema debe permitir visualizar el catalogo de productos. |
| RF-CLI-02 | Cada producto debe mostrar nombre, precio, categoria y stock. |
| RF-CLI-03 | El sistema debe obtener los productos desde el backend. |
| RF-CLI-04 | El cliente debe poder filtrar productos por categoria. |
| RF-CLI-05 | El sistema debe identificar los productos sin stock como agotados. |
| RF-CLI-06 | El endpoint del catalogo debe devolver datos en formato JSON. |

## 3. Estructura de datos del producto

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Numero | Identificador unico del producto. |
| `nombre` | Texto | Nombre que se muestra al cliente. |
| `precio` | Numero | Precio de venta del producto. |
| `stock` | Numero | Cantidad disponible. |
| `categoria` | Texto | Categoria del producto. |

## 4. Alcance por semana

| Semana | Actividad | Resultado |
| --- | --- | --- |
| S1-S2 | Definir requisitos del modulo de consulta de catalogo. | Requisitos funcionales del Cliente. |
| S2-S3 | Definir estructura de datos y wireframe del catalogo. | Campos del producto y propuesta de interfaz. |
| S3 | Configurar la estructura backend del modulo Cliente. | Servidor Express y datos de productos. |
| S4-S5 | Reutilizar el modelo y repositorio de Producto para lectura. | Datos preparados para consulta. |
| S6 | Implementar el endpoint de consulta del catalogo. | `GET /api/productos` funcionando. |

## 5. Criterios de aceptacion

- El catalogo se puede abrir desde el frontend.
- Los productos se cargan desde la API y no desde datos escritos directamente en la vista.
- Cada producto muestra nombre, precio, categoria y stock.
- Los filtros muestran solamente la categoria seleccionada.
- La API responde correctamente en `GET /api/productos`.
- El endpoint de estado responde con el modulo `cliente`.

## 6. Fuera del alcance de este entregable

Hasta la semana 6 no se incluyen las tareas de administrador ni vendedor. Tampoco se presentan como parte de este documento los módulos posteriores de autenticacion avanzada, carrito o reportes.

## 7. Evidencias

- Rama Git: `cliente`.
- Interfaz del catalogo en el frontend.
- Endpoint: `http://localhost:3002/api/productos`.
- Commits de la rama `cliente`.
