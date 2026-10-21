const { obtenerEstadoAdmin } = require('../services/adminService');

const obtenerEstado = (req, res) => {
  const resultado = obtenerEstadoAdmin();

  res.json(resultado);
};

module.exports = {
  obtenerEstado
};