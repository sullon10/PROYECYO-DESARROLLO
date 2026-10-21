
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Rutas y seguridad del módulo Administrador
const adminRoutes = require('./admin/routes/adminRoutes');
const authRoutes = require('./admin/routes/authRoutes');
const verificarAdmin = require('./admin/middlewares/verificarAdmin');

// Rutas de productos y ventas del proyecto grupal
const productosRoutes = require('./routes/productos.routes');
const ventasRoutes = require('./routes/ventas.routes');

const app = express();

// Middlewares generales
app.use(cors());
app.use(express.json());

// Autenticación con JWT
app.use('/api/auth', authRoutes);

// Rutas protegidas del administrador
app.use('/api/admin', verificarAdmin, adminRoutes);

// Rutas del proyecto grupal
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);

// Verificar el estado del servidor
app.get('/api/status', (req, res) => {
  res.json({
    estado: 'ok',
    modulo: 'cafeteria'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(
    `Servidor de CafeteriaWeb corriendo en http://localhost:${PORT}`
  );
});
