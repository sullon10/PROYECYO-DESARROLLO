const jwt = require('jsonwebtoken');
const usuarioRepository = require('../admin/repositories/usuarioRepository');

const verificarVendedor = (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      mensaje: 'Autenticación no configurada'
    });
  }

  const autorizacion = req.headers.authorization;
  if (!autorizacion || !autorizacion.startsWith('Bearer ')) {
    return res.status(401).json({
      mensaje: 'Debes iniciar sesión para realizar esta acción.'
    });
  }

  let datos;
  try {
    datos = jwt.verify(autorizacion.slice(7).trim(), process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        mensaje: 'Tu sesión venció. Inicia sesión nuevamente.'
      });
    }

    return res.status(401).json({
      mensaje: 'Token inválido. Inicia sesión nuevamente.'
    });
  }

  if (datos.rol !== 'vendedor') {
    return res.status(403).json({
      mensaje: 'No tienes permisos de vendedor.'
    });
  }

  const usuario = usuarioRepository.obtenerTodos().find(
    (registro) => registro.id === datos.id
  );

  if (!usuario || usuario.estado !== true || usuario.rol !== 'vendedor') {
    return res.status(403).json({
      mensaje: 'El vendedor no está autorizado.'
    });
  }

  req.usuario = usuario;
  next();
};

module.exports = verificarVendedor;
