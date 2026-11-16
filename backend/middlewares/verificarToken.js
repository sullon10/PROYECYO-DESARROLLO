const jwt = require('jsonwebtoken');
const usuarioRepository = require('../admin/repositories/usuarioRepository');

function verificarToken(req, res, next) {
  const autorizacion = req.headers.authorization;

  if (!autorizacion || !autorizacion.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión para continuar.' });
  }

  try {
    const token = autorizacion.slice(7).trim();
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = usuarioRepository.obtenerTodos().find((item) => item.id === datos.id);

    if (!usuario || usuario.estado !== true || usuario.rol !== datos.rol) {
      return res.status(401).json({ mensaje: 'Usuario no autorizado.' });
    }

    req.usuario = usuario;
    next();
  } catch {
    return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
}

function permitirRoles(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para esta operación.' });
    }
    next();
  };
}

module.exports = { verificarToken, permitirRoles };
