const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarioRepository');

const rolesPermitidos = ['administrador', 'admin', 'cliente', 'vendedor'];

function comprobarConfiguracion() {
  if (!process.env.JWT_SECRET) {
    const error = new Error('Autenticación no configurada');
    error.status = 500;
    throw error;
  }
}

function presentarUsuario(usuario) {
  return {
    id: usuario.id,
    nombres: usuario.nombres,
    correo: usuario.correo,
    rol: usuario.rol
  };
}

function crearToken(usuario) {
  comprobarConfiguracion();
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
}

const login = async (req, res) => {
  try {
    const { correo, contraseña } = req.body || {};
    if (typeof correo !== 'string' || typeof contraseña !== 'string' || !correo.trim() || !contraseña) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
    }

    const usuario = usuarioRepository.obtenerTodos().find(
      (item) => item.correo.toLowerCase() === correo.trim().toLowerCase()
    );

    if (!usuario || usuario.estado !== true || !rolesPermitidos.includes(usuario.rol)) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    if (typeof usuario.contraseña !== 'string' || !/^\$2[aby]\$/.test(usuario.contraseña)) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token: crearToken(usuario),
      usuario: presentarUsuario(usuario)
    });
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(error.status || 500).json({ mensaje: error.message || 'Error interno del servidor' });
  }
};

const registrarCliente = async (req, res) => {
  try {
    const { nombres, apellidos = '', correo, contraseña } = req.body || {};
    const correoNormalizado = typeof correo === 'string' ? correo.trim().toLowerCase() : '';

    if (!nombres?.trim() || !correoNormalizado || typeof contraseña !== 'string' || contraseña.length < 6) {
      return res.status(400).json({
        mensaje: 'Nombres, correo y una contraseña de al menos 6 caracteres son obligatorios.'
      });
    }

    const existe = usuarioRepository.obtenerTodos().some(
      (usuario) => usuario.correo.toLowerCase() === correoNormalizado
    );
    if (existe) {
      return res.status(409).json({ mensaje: 'Ya existe una cuenta con ese correo.' });
    }

    const contraseñaHash = await bcrypt.hash(contraseña, 10);
    const usuario = usuarioRepository.crear({
      nombres: nombres.trim(),
      apellidos: String(apellidos).trim(),
      correo: correoNormalizado,
      contraseña: contraseñaHash,
      rol: 'cliente',
      estado: true
    });

    res.status(201).json({
      mensaje: 'Cuenta creada correctamente',
      token: crearToken(usuario),
      usuario: presentarUsuario(usuario)
    });
  } catch (error) {
    console.error('Error al registrar cliente:', error);
    res.status(error.status || 500).json({ mensaje: error.message || 'Error interno del servidor' });
  }
};

module.exports = { login, registrarCliente };
