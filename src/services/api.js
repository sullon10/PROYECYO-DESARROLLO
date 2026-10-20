
const API_URL = 'http://localhost:3001/api';
const API_ADMIN = `${API_URL}/admin`;

// ====================================
// AUTENTICACIÓN DEL ADMINISTRADOR
// ====================================

export const obtenerHeadersAdmin = () => {
  const token =
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('adminToken');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Solicitudes protegidas del Administrador
const solicitarAdmin = async (ruta, opciones = {}) => {
  const respuesta = await fetch(`${API_ADMIN}${ruta}`, {
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

    let mensaje = `Error al procesar la solicitud (${respuesta.status})`;

    try {
      const datos = await respuesta.json();
      mensaje = datos.mensaje || datos.error || mensaje;
    } catch {
      // Conservar el mensaje predeterminado
    }

    throw new Error(mensaje);
  }

  if (respuesta.status === 204) {
    return null;
  }

  return respuesta.json();
};

// ====================================
// ADMINISTRADOR: GESTIÓN DE PRODUCTOS
// ====================================

export const obtenerProductosAdmin = async () => {
  return solicitarAdmin('/productos');
};

export const crearProducto = async (producto) => {
  return solicitarAdmin('/productos', {
    method: 'POST',
    body: JSON.stringify(producto)
  });
};

export const actualizarProducto = async (id, producto) => {
  return solicitarAdmin(`/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(producto)
  });
};

export const eliminarProducto = async (id) => {
  return solicitarAdmin(`/productos/${id}`, {
    method: 'DELETE'
  });
};

// ====================================
// ADMINISTRADOR: GESTIÓN DE VENDEDORES
// ====================================

export const obtenerVendedores = async () => {
  return solicitarAdmin('/vendedores');
};

export const crearVendedor = async (email, nombre) => {
  return solicitarAdmin('/vendedores', {
    method: 'POST',
    body: JSON.stringify({ email, nombre })
  });
};

export const actualizarVendedor = async (id, datos) => {
  return solicitarAdmin(`/vendedores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  });
};

export const eliminarVendedor = async (id) => {
  return solicitarAdmin(`/vendedores/${id}`, {
    method: 'DELETE'
  });
};

// ====================================
// ADMINISTRADOR: REPORTES
// ====================================

export const obtenerReporteAdmin = async () => {
  return solicitarAdmin('/reportes');
};

// ====================================
// CLIENTE Y VENDEDOR: PRODUCTOS
// ====================================

export async function obtenerProductos() {
  const respuesta = await fetch(`${API_URL}/productos`);

  if (!respuesta.ok) {
    throw new Error('Error al obtener productos');
  }

  return respuesta.json();
}

// ====================================
// VENDEDOR: REGISTRAR VENTAS
// ====================================

export async function registrarVenta({ vendedorId, items }) {
  const respuesta = await fetch(`${API_URL}/ventas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vendedorId,
      items
    })
  });

  let datos;

  try {
    datos = await respuesta.json();
  } catch {
    throw new Error('El servidor devolvió una respuesta inválida');
  }

  if (!respuesta.ok) {
    throw new Error(
      datos.error ||
      datos.mensaje ||
      'Error al registrar la venta'
    );
  }

  return datos;
}
