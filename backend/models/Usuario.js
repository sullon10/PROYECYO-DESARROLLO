class Usuario {
  constructor({
    id,
    nombres,
    apellidos,
    correo,
    contraseña,
    rol,
    estado = true
  }) {
    this.id = id;
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.correo = correo;
    this.contraseña = contraseña;
    this.rol = rol;
    this.estado = estado;
  }
}

module.exports = Usuario;