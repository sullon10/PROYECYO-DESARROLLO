const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productos.routes');
const ventasRoutes = require('./routes/ventas.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor de CafeteriaWeb corriendo en http://localhost:${PORT}`);
});