const API_URL = 'http://localhost:3001/api';

function obtenerToken() {
  return (
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('adminToken') ||
    localStorage.getItem('token') ||
    ''
  );
}

async function solicitarCliente(ruta, opciones = {}) {
  const token = obtenerToken();
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers
    }
  });

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }

  if (!respuesta.ok) {
    throw new Error(
      datos?.error || datos?.mensaje || `Error del servidor (${respuesta.status})`
    );
  }

  return datos;
}

export const obtenerCatalogo = () => solicitarCliente('/productos');

export const crearPedidoCliente = ({ clienteId, items }) =>
  solicitarCliente('/pedidos', {
    method: 'POST',
    body: JSON.stringify({ clienteId, items })
  });

export const actualizarPedidoCliente = (codigo, { clienteId, items }) =>
  solicitarCliente(`/pedidos/${encodeURIComponent(codigo)}`, {
    method: 'PATCH',
    body: JSON.stringify({ clienteId, items })
  });

export const obtenerPedidosCliente = (clienteId) =>
  solicitarCliente(`/pedidos/cliente/${encodeURIComponent(clienteId)}`);

export const cancelarPedidoCliente = (codigo) =>
  solicitarCliente(`/pedidos/${encodeURIComponent(codigo)}/cancelar`, {
    method: 'PATCH'
  });
