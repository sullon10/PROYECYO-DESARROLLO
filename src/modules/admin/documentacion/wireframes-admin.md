
````markdown
# Wireframes del Panel Administrador

## 1. Descripción

Los wireframes representan una propuesta inicial de la interfaz del módulo administrador del sistema web de la cafetería.

El objetivo es definir la distribución de los principales elementos de la interfaz antes de realizar mejoras visuales o implementar nuevas funcionalidades.

El diseño está orientado a facilitar la administración de productos, vendedores y la consulta de reportes.

---

## 2. Objetivo del diseño

El objetivo de los wireframes es establecer una estructura clara y organizada para el panel administrador, permitiendo que el usuario pueda acceder fácilmente a las principales funcionalidades del sistema.

Las funcionalidades principales consideradas son:

- Gestión de productos.
- Gestión de vendedores.
- Consulta de reportes.
- Navegación entre las diferentes opciones del módulo.
- Visualización organizada de la información.

---

## 3. Wireframe del panel principal

El panel principal será la pantalla de inicio del administrador.

Desde esta pantalla se podrá acceder a las opciones principales del módulo.

### Estructura propuesta

```text
+------------------------------------------------------+
|              SISTEMA WEB - CAFETERÍA                 |
+------------------------------------------------------+
| Inicio | Productos | Vendedores | Reportes | Salir  |
+------------------------------------------------------+
|                                                      |
|              PANEL DE ADMINISTRACIÓN                 |
|                                                      |
|   +----------------+   +----------------+            |
|   |   PRODUCTOS    |   |  VENDEDORES    |            |
|   |                |   |                |            |
|   | Gestionar      |   | Gestionar      |            |
|   | productos      |   | vendedores     |            |
|   +----------------+   +----------------+            |
|                                                      |
|              +----------------------+                |
|              |       REPORTES       |                |
|              |                      |                |
|              | Consultar información|                |
|              +----------------------+                |
|                                                      |
+------------------------------------------------------+
````

### Elementos principales

* Menú de navegación.
* Acceso a productos.
* Acceso a vendedores.
* Acceso a reportes.
* Opción para cerrar sesión.
* Área principal del panel administrador.

---

## 4. Wireframe de gestión de productos

La pantalla de gestión de productos permitirá al administrador consultar y administrar los productos disponibles en la cafetería.

### Estructura propuesta

```text
+------------------------------------------------------+
|                GESTIÓN DE PRODUCTOS                  |
+------------------------------------------------------+
| Buscar producto: [________________] [Buscar]         |
+------------------------------------------------------+
| [ + Nuevo producto ]                                 |
+------------------------------------------------------+
| ID | Nombre | Categoría | Precio | Stock | Acciones  |
+------------------------------------------------------+
| 01 | Producto 1 | Bebida | 5.00 | 20 | Editar Elim. |
| 02 | Producto 2 | Comida | 8.00 | 15 | Editar Elim. |
| 03 | Producto 3 | Postre | 6.00 | 10 | Editar Elim. |
+------------------------------------------------------+
```

### Funcionalidades

* Visualizar productos registrados.
* Buscar productos.
* Registrar nuevos productos.
* Editar productos.
* Eliminar productos.
* Consultar precio.
* Consultar stock.
* Consultar categoría.
* Controlar el estado del producto.

### Relación con el sistema

Esta interfaz se relaciona directamente con el componente:

`GestionProductos.jsx`

---

## 5. Wireframe de registro de producto

Cuando el administrador seleccione la opción de nuevo producto, podrá ingresar la información correspondiente.

### Estructura propuesta

```text
+----------------------------------------------+
|             REGISTRAR PRODUCTO               |
+----------------------------------------------+
|                                              |
| Nombre:       [________________________]     |
|                                              |
| Descripción:  [________________________]     |
|                                              |
| Precio:       [________________________]     |
|                                              |
| Categoría:    [________________________]     |
|                                              |
| Stock:        [________________________]     |
|                                              |
| Estado:       [ Activo ▼ ]                   |
|                                              |
|       [Guardar]       [Cancelar]             |
|                                              |
+----------------------------------------------+
```

### Datos principales

* Nombre.
* Descripción.
* Precio.
* Categoría.
* Stock.
* Estado.

---

## 6. Wireframe de gestión de vendedores

La pantalla de gestión de vendedores permitirá al administrador consultar y gestionar la información de los vendedores registrados.

### Estructura propuesta

```text
+------------------------------------------------------+
|                GESTIÓN DE VENDEDORES                 |
+------------------------------------------------------+
| Buscar vendedor: [________________] [Buscar]         |
+------------------------------------------------------+
| [ + Nuevo vendedor ]                                 |
+------------------------------------------------------+
| ID | Nombres | Apellidos | Correo | Estado | Acción  |
+------------------------------------------------------+
| 01 | Juan    | Pérez     | ...    | Activo | Editar  |
| 02 | María   | López     | ...    | Activo | Editar  |
| 03 | Carlos  | Ruiz      | ...    | Inactivo|Editar |
+------------------------------------------------------+
```

### Funcionalidades

* Visualizar vendedores.
* Buscar vendedores.
* Registrar vendedores.
* Modificar información.
* Consultar estado del vendedor.
* Activar o desactivar vendedores.

### Relación con el sistema

Esta interfaz se relaciona directamente con el componente:

`GestionVendedores.jsx`

---

## 7. Wireframe de registro de vendedor

La interfaz permitirá registrar un nuevo vendedor mediante un formulario.

### Estructura propuesta

```text
+----------------------------------------------+
|             REGISTRAR VENDEDOR               |
+----------------------------------------------+
|                                              |
| Nombres:      [________________________]     |
|                                              |
| Apellidos:    [________________________]     |
|                                              |
| Correo:       [________________________]     |
|                                              |
| Contraseña:   [________________________]     |
|                                              |
| Estado:       [ Activo ▼ ]                   |
|                                              |
|       [Guardar]       [Cancelar]             |
|                                              |
+----------------------------------------------+
```

### Datos principales

* Nombres.
* Apellidos.
* Correo.
* Contraseña.
* Estado.

---

## 8. Wireframe de reportes

La pantalla de reportes permitirá al administrador consultar información general relacionada con los productos y vendedores.

### Estructura propuesta

```text
+------------------------------------------------------+
|                     REPORTES                         |
+------------------------------------------------------+
|                                                      |
|  +----------------+  +----------------+              |
|  |   PRODUCTOS    |  |  VENDEDORES    |              |
|  |                |  |                |              |
|  | Total: 25      |  | Total: 8       |              |
|  +----------------+  +----------------+              |
|                                                      |
|  +-----------------------------------------------+   |
|  |              RESUMEN GENERAL                  |   |
|  |                                               |   |
|  | Productos disponibles: 20                     |   |
|  | Productos agotados: 5                         |   |
|  | Vendedores activos: 7                         |   |
|  | Vendedores inactivos: 1                       |   |
|  +-----------------------------------------------+   |
|                                                      |
+------------------------------------------------------+
```

### Información mostrada

* Total de productos.
* Productos disponibles.
* Productos agotados.
* Total de vendedores.
* Vendedores activos.
* Vendedores inactivos.

### Relación con el sistema

Esta interfaz se relaciona directamente con el componente:

`ReportesAdmin.jsx`

---

## 9. Navegación del módulo administrador

La navegación propuesta permite acceder a las principales funciones desde el panel administrador.

### Flujo de navegación

```text
                    PANEL ADMINISTRADOR
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
        PRODUCTOS     VENDEDORES      REPORTES
             |             |             |
             v             v             v
        Gestionar      Gestionar      Consultar
        productos      vendedores     información
             |
             v
       Registrar / Editar
          / Eliminar
```

---

## 10. Estructura general de navegación

El administrador tendrá acceso a las siguientes opciones:

| Opción     | Función                    |
| ---------- | -------------------------- |
| Inicio     | Mostrar el panel principal |
| Productos  | Gestionar productos        |
| Vendedores | Gestionar vendedores       |
| Reportes   | Consultar información      |
| Salir      | Cerrar la sesión           |

---

## 11. Relación con los componentes desarrollados

Los wireframes se relacionan con los componentes que forman parte del módulo administrador.

| Wireframe             | Componente              |
| --------------------- | ----------------------- |
| Panel administrador   | Módulo `admin`          |
| Gestión de productos  | `GestionProductos.jsx`  |
| Gestión de vendedores | `GestionVendedores.jsx` |
| Reportes              | `ReportesAdmin.jsx`     |

---

## 12. Criterios de diseño

Para el diseño de las interfaces se consideran los siguientes criterios:

* Interfaz sencilla.
* Navegación clara.
* Organización de la información.
* Acceso rápido a las funciones principales.
* Uso de tablas para mostrar información.
* Uso de formularios para registrar datos.
* Separación de las funcionalidades.
* Diseño preparado para adaptarse a diferentes tamaños de pantalla.

---

## 13. Consideraciones de usabilidad

El panel administrador debe permitir que las operaciones principales puedan realizarse de manera sencilla.

Se considera importante:

* Utilizar nombres claros para los botones.
* Mantener una estructura uniforme.
* Mostrar mensajes cuando una operación sea realizada.
* Solicitar confirmación antes de eliminar información.
* Facilitar la búsqueda de productos y vendedores.
* Mantener una navegación sencilla.

---

## 14. Resultado de la fase

Los wireframes permiten establecer una propuesta inicial para la interfaz del módulo administrador.

La propuesta contempla el panel principal, la gestión de productos, la gestión de vendedores y la consulta de reportes.

Estos diseños servirán como referencia para continuar con el desarrollo de la interfaz y posteriormente integrar las funcionalidades del backend.

---

## 15. Conclusión

El diseño de los wireframes permite organizar visualmente las principales funcionalidades del módulo administrador antes de continuar con las siguientes etapas del proyecto.

La estructura propuesta busca facilitar la administración de los productos y vendedores y permitir una consulta rápida de los reportes del sistema.

