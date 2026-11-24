const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const app = require('../server');
const dataDir = path.join(__dirname, '../data');
const archivosDatos = ['usuarios.json', 'pedidos.json', 'productos.json', 'ventas.json'];
const respaldos = new Map();
let servidor;
let baseUrl;

function url(ruta) {
  return `${baseUrl}${ruta}`;
}

async function solicitar(ruta, opciones) {
  const respuesta = await fetch(url(ruta), opciones);
  const datos = await respuesta.json();
  return { respuesta, datos };
}

test.before(async () => {
  archivosDatos.forEach((archivo) => {
    const ruta = path.join(dataDir, archivo);
    respaldos.set(archivo, fs.readFileSync(ruta));
  });
  servidor = app.listen(0);
  await new Promise((resolve) => servidor.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${servidor.address().port}/api`;
});

test.after(async () => {
  archivosDatos.forEach((archivo) => {
    fs.writeFileSync(path.join(dataDir, archivo), respaldos.get(archivo));
  });
  await new Promise((resolve, reject) => servidor.close((error) => error ? reject(error) : resolve()));
});

test('flujo completo del cliente', async () => {
  const correo = `cliente-${Date.now()}@test.local`;
  const contraseña = 'cliente123';

  const registro = await solicitar('/auth/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombres: 'Cliente', apellidos: 'Prueba', correo, contraseña })
  });
  assert.equal(registro.respuesta.status, 201);
  assert.equal(registro.datos.usuario.rol, 'cliente');

  const login = await solicitar('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contraseña })
  });
  assert.equal(login.respuesta.status, 200);
  assert.ok(login.datos.token);
  const token = login.datos.token;
  const clienteId = login.datos.usuario.id;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const catalogo = await solicitar('/productos');
  assert.equal(catalogo.respuesta.status, 200);
  assert.ok(catalogo.datos.length > 0);

  const sinToken = await solicitar('/pedidos/cliente/1');
  assert.equal(sinToken.respuesta.status, 401);

  const pedido = await solicitar('/pedidos', {
    method: 'POST',
    headers,
    body: JSON.stringify({ clienteId: 9999, items: [{ productoId: 1, cantidad: 1 }] })
  });
  assert.equal(pedido.respuesta.status, 201);
  assert.equal(pedido.datos.clienteId, clienteId);

  const editado = await solicitar(`/pedidos/${pedido.datos.codigo}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ clienteId: 9999, items: [{ productoId: 1, cantidad: 2 }] })
  });
  assert.equal(editado.respuesta.status, 200);
  assert.equal(editado.datos.items[0].cantidad, 2);

  const cancelado = await solicitar(`/pedidos/${pedido.datos.codigo}/cancelar`, {
    method: 'PATCH',
    headers
  });
  assert.equal(cancelado.respuesta.status, 200);
  assert.equal(cancelado.datos.estado, 'cancelado');

  const sinStock = await solicitar('/pedidos', {
    method: 'POST',
    headers,
    body: JSON.stringify({ items: [{ productoId: 1, cantidad: 9999 }] })
  });
  assert.equal(sinStock.respuesta.status, 409);
});


// ---------- Pruebas adicionales del módulo Cliente ----------

// Registra un cliente nuevo, inicia sesión y devuelve sus datos y cabeceras
async function crearClienteConSesion(prefijo) {
  const correo = `${prefijo}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.local`;
  const contraseña = 'cliente123';

  await solicitar('/auth/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombres: 'Cliente', apellidos: 'Prueba', correo, contraseña })
  });

  const login = await solicitar('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contraseña })
  });

  return {
    id: login.datos.usuario.id,
    headers: {
      Authorization: `Bearer ${login.datos.token}`,
      'Content-Type': 'application/json'
    }
  };
}

function crearPedidoDePrueba(headers, items = [{ productoId: 1, cantidad: 1 }]) {
  return solicitar('/pedidos', {
    method: 'POST',
    headers,
    body: JSON.stringify({ items })
  });
}

test('editar un pedido pendiente actualiza cantidad y total', async () => {
  const cliente = await crearClienteConSesion('editar');
  const { datos: catalogo } = await solicitar('/productos');
  const producto = catalogo[0];

  const pedido = await crearPedidoDePrueba(cliente.headers, [
    { productoId: producto.id, cantidad: 1 }
  ]);
  assert.equal(pedido.respuesta.status, 201);
  assert.equal(pedido.datos.estado, 'pendiente');

  const editado = await solicitar(`/pedidos/${pedido.datos.codigo}`, {
    method: 'PATCH',
    headers: cliente.headers,
    body: JSON.stringify({ items: [{ productoId: producto.id, cantidad: 3 }] })
  });

  assert.equal(editado.respuesta.status, 200);
  assert.equal(editado.datos.items[0].cantidad, 3);
  assert.equal(editado.datos.total, +(producto.precio * 3).toFixed(2));
});

test('cancelar un pedido pendiente cambia su estado a cancelado', async () => {
  const cliente = await crearClienteConSesion('cancelar');
  const pedido = await crearPedidoDePrueba(cliente.headers);

  const cancelado = await solicitar(`/pedidos/${pedido.datos.codigo}/cancelar`, {
    method: 'PATCH',
    headers: cliente.headers
  });
  assert.equal(cancelado.respuesta.status, 200);
  assert.equal(cancelado.datos.estado, 'cancelado');

  // Debe verse como cancelado en el historial del cliente
  const historial = await solicitar(`/pedidos/cliente/${cliente.id}`, {
    headers: cliente.headers
  });
  const guardado = historial.datos.find((p) => p.codigo === pedido.datos.codigo);
  assert.equal(guardado.estado, 'cancelado');
});

test('un pedido cancelado no se puede cancelar ni editar de nuevo', async () => {
  const cliente = await crearClienteConSesion('doble');
  const pedido = await crearPedidoDePrueba(cliente.headers);
  const codigo = pedido.datos.codigo;

  await solicitar(`/pedidos/${codigo}/cancelar`, {
    method: 'PATCH',
    headers: cliente.headers
  });

  const otraVezCancelar = await solicitar(`/pedidos/${codigo}/cancelar`, {
    method: 'PATCH',
    headers: cliente.headers
  });
  assert.equal(otraVezCancelar.respuesta.status, 409);

  const editar = await solicitar(`/pedidos/${codigo}`, {
    method: 'PATCH',
    headers: cliente.headers,
    body: JSON.stringify({ items: [{ productoId: 1, cantidad: 2 }] })
  });
  assert.equal(editar.respuesta.status, 409);
});

test('un cliente no puede editar, cancelar ni consultar pedidos de otro cliente', async () => {
  const duenio = await crearClienteConSesion('duenio');
  const intruso = await crearClienteConSesion('intruso');
  const pedido = await crearPedidoDePrueba(duenio.headers);
  const codigo = pedido.datos.codigo;

  const editar = await solicitar(`/pedidos/${codigo}`, {
    method: 'PATCH',
    headers: intruso.headers,
    body: JSON.stringify({ items: [{ productoId: 1, cantidad: 2 }] })
  });
  assert.equal(editar.respuesta.status, 403);

  const cancelar = await solicitar(`/pedidos/${codigo}/cancelar`, {
    method: 'PATCH',
    headers: intruso.headers
  });
  assert.equal(cancelar.respuesta.status, 403);

  const historialAjeno = await solicitar(`/pedidos/cliente/${duenio.id}`, {
    headers: intruso.headers
  });
  assert.equal(historialAjeno.respuesta.status, 403);

  // El pedido del dueño sigue intacto
  const propio = await solicitar(`/pedidos/${codigo}`, { headers: duenio.headers });
  assert.equal(propio.datos.estado, 'pendiente');
});

test('stock insuficiente: no se puede crear ni editar un pedido', async () => {
  const cliente = await crearClienteConSesion('stock');

  const crear = await crearPedidoDePrueba(cliente.headers, [
    { productoId: 1, cantidad: 9999 }
  ]);
  assert.equal(crear.respuesta.status, 409);
  assert.match(crear.datos.error, /Stock insuficiente/);

  const pedido = await crearPedidoDePrueba(cliente.headers);
  assert.equal(pedido.respuesta.status, 201);

  const editar = await solicitar(`/pedidos/${pedido.datos.codigo}`, {
    method: 'PATCH',
    headers: cliente.headers,
    body: JSON.stringify({ items: [{ productoId: 1, cantidad: 9999 }] })
  });
  assert.equal(editar.respuesta.status, 409);

  // El pedido conserva la cantidad original
  const sinCambios = await solicitar(`/pedidos/${pedido.datos.codigo}`, {
    headers: cliente.headers
  });
  assert.equal(sinCambios.datos.items[0].cantidad, 1);
});

test('crear un pedido con datos inválidos devuelve error', async () => {
  const cliente = await crearClienteConSesion('invalido');

  const vacio = await crearPedidoDePrueba(cliente.headers, []);
  assert.equal(vacio.respuesta.status, 400);

  const cantidadCero = await crearPedidoDePrueba(cliente.headers, [
    { productoId: 1, cantidad: 0 }
  ]);
  assert.equal(cantidadCero.respuesta.status, 400);

  const cantidadNegativa = await crearPedidoDePrueba(cliente.headers, [
    { productoId: 1, cantidad: -2 }
  ]);
  assert.equal(cantidadNegativa.respuesta.status, 400);

  const inexistente = await crearPedidoDePrueba(cliente.headers, [
    { productoId: 99999, cantidad: 1 }
  ]);
  assert.equal(inexistente.respuesta.status, 404);
});

test('sin sesión no se puede crear, editar ni cancelar pedidos', async () => {
  const crear = await solicitar('/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ productoId: 1, cantidad: 1 }] })
  });
  assert.equal(crear.respuesta.status, 401);

  const cancelar = await solicitar('/pedidos/PED-0000/cancelar', { method: 'PATCH' });
  assert.equal(cancelar.respuesta.status, 401);
});