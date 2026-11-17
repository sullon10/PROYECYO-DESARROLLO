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
