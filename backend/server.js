const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba para verificar que el servidor levanta correctamente
app.get('/api/status', (req, res) => {
  res.json({ estado: 'ok', modulo: 'vendedor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor de CafeteriaWeb corriendo en http://localhost:${PORT}`);
});