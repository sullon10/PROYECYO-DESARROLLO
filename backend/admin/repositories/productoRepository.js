const fs = require('fs');
const path = require('path');
const Producto = require('../../models/Producto');

const rutaArchivo = path.join(__dirname, '../../data/productos.json');

const leerProductos = () => {
  const datos = fs.readFileSync(rutaArchivo, 'utf-8');
  return JSON.parse(datos);
};

const guardarProductos = (productos) => {
  fs.writeFileSync(
    rutaArchivo,
    JSON.stringify(productos, null, 2),
    'utf-8'
  );
};

// LISTAR todos los productos
const obtenerTodos = () => {
  return leerProductos();
};

// BUSCAR producto por ID
const obtenerPorId = (id) => {
  const productos = leerProductos();
  return productos.find((producto) => producto.id === Number(id));
};

// CREAR producto
const crear = ({ nombre, precio, stock, categoria }) => {
  const productos = leerProductos();

  const nuevoId =
    productos.length > 0
      ? Math.max(...productos.map((producto) => producto.id)) + 1
      : 1;

  const nuevoProducto = new Producto({
    id: nuevoId,
    nombre,
    precio,
    stock,
    categoria
  });

  productos.push(nuevoProducto);
  guardarProductos(productos);

  return nuevoProducto;
};

// ACTUALIZAR producto
const actualizar = (id, datos) => {
  const productos = leerProductos();
  const indice = productos.findIndex(
    (producto) => producto.id === Number(id)
  );

  if (indice === -1) {
    return null;
  }

  productos[indice] = {
    ...productos[indice],
    ...datos,
    id: Number(id)
  };

  guardarProductos(productos);

  return productos[indice];
};

// ELIMINAR producto
const eliminar = (id) => {
  const productos = leerProductos();
  const indice = productos.findIndex(
    (producto) => producto.id === Number(id)
  );

  if (indice === -1) {
    return null;
  }

  const productoEliminado = productos[indice];

  productos.splice(indice, 1);
  guardarProductos(productos);

  return productoEliminado;
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};