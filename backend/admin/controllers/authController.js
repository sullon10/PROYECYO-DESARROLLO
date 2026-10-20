
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarioRepository');

const login = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (
      typeof correo !== 'string' ||
      typeof contraseña !== 'string' ||
      !correo.trim() ||
      !contraseña
    ) {
      return res.status(400).json({
        mensaje: 'Correo y contraseña son obligatorios'
      });
    }

    const usuario = usuarioRepository.obtenerTodos().find(
      (u) => u.correo.toLowerCase() === correo.trim().toLowerCase()
    );


     const rolesPermitidos = ['administrador', 'admin', 'cliente', 'vendedor'];

     if (
       !usuario ||
        usuario.estado !== true ||
       !rolesPermitidos.includes(usuario.rol)
    ) {
        return res.status(401).json({
         mensaje: 'Credenciales inválidas'
     });
   }

    
if (
  typeof usuario.contraseña !== 'string' ||
  !/^\$2[aby]\$/.test(usuario.contraseña)
) {
  return res.status(401).json({
    mensaje: 'Credenciales inválidas'
  });
}

const contraseñaValida = await bcrypt.compare(
  contraseña,
  usuario.contraseña
);

    

    if (!contraseñaValida) {
      return res.status(401).json({
        mensaje: 'Credenciales inválidas'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        mensaje: 'Autenticación no configurada'
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '2h'
      }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombres: usuario.nombres,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

module.exports = { login };
