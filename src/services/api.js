
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

async function request(ruta, opciones = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  if (opciones.body) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_URL}${ruta}`, { ...opciones, headers });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!res.ok) {
    throw new Error(data?.error || `Error del servidor (${res.status})`);
  }
  return data;
}

// ====================================
// VENDEDOR: HISTORIAL DE VENTAS
// ====================================

export const obtenerProductos = () => request('/productos');

export const registrarVenta = ({ vendedorId, items }) =>
  request('/ventas', { method: 'POST', body: JSON.stringify({ vendedorId, items }) });

export const obtenerHistorialVentas = () => request('/ventas');

export const obtenerReporteVentas = () => request('/ventas/reporte');

// ====================================
// PEDIDOS: el cliente los genera, el vendedor los atiende
// ====================================

export const crearPedido = ({ clienteId, items }) =>
  request('/pedidos', { method: 'POST', body: JSON.stringify({ clienteId, items }) });

export const obtenerPedidos = () => request('/pedidos');

export const obtenerPedido = (codigo) =>
  request(`/pedidos/${encodeURIComponent(codigo)}`);

export const obtenerPedidosCliente = (clienteId) =>
  request(`/pedidos/cliente/${clienteId}`);

export const entregarPedido = (codigo, vendedorId) =>
  request(`/pedidos/${encodeURIComponent(codigo)}/entregar`, {
    method: 'PATCH',
    body: JSON.stringify({ vendedorId }),
  });

export const cancelarPedido = (codigo) =>
  request(`/pedidos/${encodeURIComponent(codigo)}/cancelar`, { method: 'PATCH' });

export const reactivarPedido = (codigo) =>
  request(`/pedidos/${encodeURIComponent(codigo)}/reactivar`, { method: 'PATCH' });