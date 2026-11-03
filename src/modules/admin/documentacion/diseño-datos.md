# Diseño de Datos del Módulo Administrador

## 1. Descripción

El diseño de datos define las principales entidades que serán utilizadas por el módulo administrador del sistema web de la cafetería.

Para esta etapa se consideran principalmente las entidades Usuario y Producto, las cuales permitirán organizar la información necesaria para la gestión administrativa.

## 2. Entidad Usuario

La entidad Usuario representa a las personas que tienen acceso o participan en el sistema.

### Atributos

| Campo | Tipo de dato | Descripción |
|---|---|---|
| id_usuario | INT | Identificador único del usuario |
| nombres | VARCHAR | Nombres del usuario |
| apellidos | VARCHAR | Apellidos del usuario |
| correo | VARCHAR | Correo electrónico |
| contraseña | VARCHAR | Contraseña de acceso |
| rol | VARCHAR | Rol que tiene dentro del sistema |
| estado | BOOLEAN | Estado del usuario |

### Funciones relacionadas

El administrador podrá consultar y gestionar la información relacionada con los usuarios y sus roles dentro del sistema.

## 3. Entidad Producto

La entidad Producto representa los productos ofrecidos por la cafetería.

### Atributos

| Campo | Tipo de dato | Descripción |
|---|---|---|
| id_producto | INT | Identificador único del producto |
| nombre | VARCHAR | Nombre del producto |
| descripcion | VARCHAR | Descripción del producto |
| precio | DECIMAL | Precio del producto |
| categoria | VARCHAR | Categoría del producto |
| stock | INT | Cantidad disponible |
| estado | BOOLEAN | Estado del producto |

### Funciones relacionadas

El administrador podrá registrar, consultar, modificar y eliminar productos de la cafetería.

## 4. Relación entre las entidades

La entidad Usuario permite identificar a los usuarios y sus roles dentro del sistema, mientras que la entidad Producto almacena la información de los productos administrados por la cafetería.

El administrador será el responsable de gestionar la información correspondiente a estas entidades.

## 5. Consideraciones del diseño

- Los identificadores serán únicos para cada registro.
- Los campos principales deben contar con tipos de datos adecuados.
- El precio de los productos debe utilizar un tipo numérico decimal.
- El stock debe utilizar un tipo de dato entero.
- Los registros deben contar con un estado que permita controlar su disponibilidad.
- La estructura podrá ampliarse posteriormente de acuerdo con los requerimientos del sistema.

## 6. Resultado

Se establece una estructura inicial de datos para las entidades Usuario y Producto, que servirá como base para el desarrollo posterior de la base de datos, modelos y operaciones CRUD del módulo administrador.