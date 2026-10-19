
const API_URL = 'http://localhost:3001/api/admin';

// Obtener el token JWT del administrador
export const obtenerHeadersAdmin = () => {
  const token = sessionStorage.getItem('adminToken');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Función reutilizable para las solicitudes del administrador
const solicitarAdmin = async (ruta, opciones = {}) => {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      ...obtenerHeadersAdmin(),
      ...opciones.headers
    }
  });

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error(
        'Sesión inválida o expirada. Cierra sesión y vuelve a ingresar.'
      );
    }

    if (respuesta.status === 403) {
      throw new Error(
        'No tienes permisos para realizar esta operación.'
      );
    }

    throw new Error(
      `Error al procesar la solicitud (${respuesta.status})`
    );
  }

  return respuesta.json();
};

// ====================================
// GESTIÓN DE PRODUCTOS
// ====================================

// Obtener todos los productos
export const obtenerProductosAdmin = async () => {
  return solicitarAdmin('/productos');
};

// Crear un producto
export const crearProducto = async (producto) => {
  return solicitarAdmin('/productos', {
    method: 'POST',
    body: JSON.stringify(producto)
  });
};

// Actualizar un producto
export const actualizarProducto = async (id, producto) => {
  return solicitarAdmin(`/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(producto)
  });
};

// Eliminar un producto
export const eliminarProducto = async (id) => {
  return solicitarAdmin(`/productos/${id}`, {
    method: 'DELETE'
  });
};

// ====================================
// GESTIÓN DE VENDEDORES
// ====================================

// Obtener vendedores
export const obtenerVendedores = async () => {
  return solicitarAdmin('/vendedores');
};

// Registrar vendedor
export const crearVendedor = async (email, nombre) => {
  return solicitarAdmin('/vendedores', {
    method: 'POST',
    body: JSON.stringify({ email, nombre })
  });
};

// Activar o desactivar vendedor
export const actualizarVendedor = async (id, datos) => {
  return solicitarAdmin(`/vendedores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  });
};

 // Eliminar vendedor
export const eliminarVendedor = async (id) => {
  return solicitarAdmin(`/vendedores/${id}`, {
    method: 'DELETE'
  });
};

// ====================================
// REPORTES DEL ADMINISTRADOR
// ====================================

// Obtener reporte de ventas
export const obtenerReporteAdmin = async () => {
  return solicitarAdmin('/reportes');
};
