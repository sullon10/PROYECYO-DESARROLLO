
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarioRepository');

const verificarAdmin = (req, res, next) => {
  const autorizacion = req.headers.authorization;

  if (!autorizacion || !autorizacion.startsWith('Bearer ')) {
    return res.status(401).json({
      mensaje: 'Acceso denegado. Debes iniciar sesión.'
    });
  }

  const token = autorizacion.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      mensaje: 'Token no proporcionado.'
    });
  }

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);

    if (datos.rol !== 'administrador') {
      return res.status(403).json({
        mensaje: 'No tienes permisos de administrador.'
      });
    }

    const usuario = usuarioRepository.obtenerTodos().find(
      (u) => u.id === datos.id
    );

    if (!usuario || !usuario.estado || usuario.rol !== 'administrador') {
      return res.status(403).json({
        mensaje: 'Usuario administrador no autorizado.'
      });
    }

    req.usuario = usuario;
    next();

  } catch (error) {
    return res.status(401).json({
      mensaje: 'Token inválido o expirado.'
    });
  }
};

module.exports = verificarAdmin;
