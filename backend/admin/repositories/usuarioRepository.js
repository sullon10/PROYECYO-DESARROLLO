const fs = require('fs');
const path = require('path');
const Usuario = require('../../models/Usuario');

const rutaArchivo = path.join(__dirname, '../../data/usuarios.json');

const leerUsuarios = () => {
  const datos = fs.readFileSync(rutaArchivo, 'utf-8');
  return JSON.parse(datos);
};

const guardarUsuarios = (usuarios) => {
  fs.writeFileSync(
    rutaArchivo,
    JSON.stringify(usuarios, null, 2),
    'utf-8'
  );
};

// LISTAR todos los usuarios
const obtenerTodos = () => {
  return leerUsuarios();
};

// BUSCAR usuario por ID
const obtenerPorId = (id) => {
  const usuarios = leerUsuarios();

  return usuarios.find(
    (usuario) => usuario.id === Number(id)
  );
};

// CREAR usuario
const crear = ({
  nombres,
  apellidos,
  correo,
  contraseña,
  rol,
  estado = true
}) => {
  const usuarios = leerUsuarios();

  const nuevoId =
    usuarios.length > 0
      ? Math.max(...usuarios.map((usuario) => usuario.id)) + 1
      : 1;

  const nuevoUsuario = new Usuario({
    id: nuevoId,
    nombres,
    apellidos,
    correo,
    contraseña,
    rol,
    estado
  });

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);

  return nuevoUsuario;
};

// ACTUALIZAR usuario
const actualizar = (id, datos) => {
  const usuarios = leerUsuarios();

  const indice = usuarios.findIndex(
    (usuario) => usuario.id === Number(id)
  );

  if (indice === -1) {
    return null;
  }

  usuarios[indice] = {
    ...usuarios[indice],
    ...datos,
    id: Number(id)
  };

  guardarUsuarios(usuarios);

  return usuarios[indice];
};

// ELIMINAR usuario
const eliminar = (id) => {
  const usuarios = leerUsuarios();

  const indice = usuarios.findIndex(
    (usuario) => usuario.id === Number(id)
  );

  if (indice === -1) {
    return null;
  }

  const usuarioEliminado = usuarios[indice];

  usuarios.splice(indice, 1);
  guardarUsuarios(usuarios);

  return usuarioEliminado;
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};