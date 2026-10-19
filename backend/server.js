
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const adminRoutes = require('./admin/routes/adminRoutes');
const authRoutes = require('./admin/routes/authRoutes');
const verificarAdmin = require('./admin/middlewares/verificarAdmin');

const app = express();

app.use(cors());
app.use(express.json());

// Ruta pública de autenticación
app.use('/api/auth', authRoutes);

// Rutas protegidas del administrador
app.use('/api/admin', verificarAdmin, adminRoutes);

// Ruta de prueba del servidor
app.get('/api/status', (req, res) => {
  res.json({
    estado: 'ok',
    modulo: 'cafeteria'
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(
    `Servidor de CafeteriaWeb corriendo en http://localhost:${PORT}`
  );
});
