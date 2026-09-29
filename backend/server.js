const express = require('express');
const cors = require('cors');

const productosRoutes = require('./routes/productos.routes');
const ventasRoutes = require('./routes/ventas.routes');

const app = express();
app.use(cors());
app.use(express.json());

// --- Autenticación (implementación temporal, sin capa de servicio aún) ---
const usuarios = [
  { id: 1, nombre: 'Cliente Demo', email: 'cliente@cafeteria.com', password: 'cafe2024', rol: 'cliente' },
  { id: 2, nombre: 'Admin Demo', email: 'admin@cafeteria.com', password: 'cafe2024', rol: 'admin' },
  { id: 3, nombre: 'Vendedor Demo', email: 'vendedor@cafeteria.com', password: 'cafe2024', rol: 'vendedor' },
];

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

  return res.json({ token, usuario: usuarioSinPassword });
});

app.get('/api/status', (req, res) => {
  res.json({ estado: 'ok' });
});

// --- Rutas del dominio (arquitectura por capas: routes -> controllers -> services -> repositories) ---
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor de CafeteriaWeb corriendo en http://localhost:${PORT}`);
});