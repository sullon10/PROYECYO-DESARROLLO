const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PRODUCTOS_PATH = path.join(__dirname, 'data', 'productos.json');
const VENTAS_PATH = path.join(__dirname, 'data', 'ventas.json');

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const usuarios = [
  { id: 1, nombre: 'Cliente Demo', email: 'cliente@cafeteria.com', password: 'cafe2024', rol: 'cliente' },
  { id: 2, nombre: 'Admin Demo', email: 'admin@cafeteria.com', password: 'cafe2024', rol: 'admin' },
  { id: 3, nombre: 'Vendedor Demo', email: 'vendedor@cafeteria.com', password: 'cafe2024', rol: 'vendedor' }
];

const getProductos = () => readJson(PRODUCTOS_PATH);
const getVentas = () => readJson(VENTAS_PATH);

app.get('/api/status', (req, res) => {
  res.json({ estado: 'ok', modulo: 'cliente' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
  }

  const usuario = usuarios.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === String(password)
  );

  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  const { password: _, ...usuarioSinPassword } = usuario;
  const token = `token-${usuario.id}`;

  return res.json({
    token,
    usuario: usuarioSinPassword
  });
});

app.get('/api/productos', (req, res) => {
  const productos = getProductos();
  res.json(productos);
});

app.post('/api/ventas', (req, res) => {
  const { clienteId, items } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Debes enviar al menos un producto.' });
  }

  const productos = getProductos();
  const ventas = getVentas();

  const productosActualizados = [...productos];
  const detalleVenta = [];

  for (const item of items) {
    const producto = productosActualizados.find((p) => Number(p.id) === Number(item.productoId));

    if (!producto) {
      return res.status(404).json({ error: `Producto ${item.productoId} no existe.` });
    }

    const cantidad = Number(item.cantidad || 0);

    if (cantidad <= 0) {
      return res.status(400).json({ error: `Cantidad inválida para ${producto.nombre}.` });
    }

    if (producto.stock < cantidad) {
      return res.status(400).json({ error: `Stock insuficiente para ${producto.nombre}.` });
    }

    producto.stock -= cantidad;
    detalleVenta.push({
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad,
      precioUnitario: producto.precio,
      subtotal: Number((producto.precio * cantidad).toFixed(2))
    });
  }

  const nuevaVenta = {
    id: Date.now(),
    clienteId: clienteId || 1,
    fecha: new Date().toISOString(),
    items: detalleVenta,
    total: Number(detalleVenta.reduce((suma, item) => suma + item.subtotal, 0).toFixed(2))
  };

  writeJson(PRODUCTOS_PATH, productosActualizados);
  writeJson(VENTAS_PATH, [...ventas, nuevaVenta]);

  res.status(201).json({
    mensaje: 'Compra realizada correctamente.',
    venta: nuevaVenta
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Servidor de CafeteriaWeb corriendo en http://localhost:${PORT}`);
});