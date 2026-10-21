const fs = require('fs');
const path = require('path');
const express = require('express');

const { obtenerEstado } = require('../controllers/adminController');
const productoRepository = require('../repositories/productoRepository');

const router = express.Router();

// Verificar el estado del administrador
router.get('/status', obtenerEstado);

// Listar productos
router.get('/productos', (req, res) => {
  try {
    const productos = productoRepository.obtenerTodos();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar producto
router.post('/productos', (req, res) => {
  try {
    const { nombre, precio, stock, categoria } = req.body;

    if (!nombre || !categoria ||
        !Number.isFinite(Number(precio)) ||
        !Number.isInteger(Number(stock)) ||
        Number(precio) < 0 || Number(stock) < 0) {
      return res.status(400).json({
        error: 'Datos del producto inválidos'
      });
    }

    const producto = productoRepository.crear({
      nombre,
      precio: Number(precio),
      stock: Number(stock),
      categoria
    });

    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar producto
router.put('/productos/:id', (req, res) => {
  try {
    const { nombre, precio, stock, categoria } = req.body;

    if (!nombre || !categoria ||
        !Number.isFinite(Number(precio)) ||
        !Number.isInteger(Number(stock)) ||
        Number(precio) < 0 || Number(stock) < 0) {
      return res.status(400).json({
        error: 'Datos del producto inválidos'
      });
    }

    const producto = productoRepository.actualizar(req.params.id, {
      nombre,
      precio: Number(precio),
      stock: Number(stock),
      categoria
    });

    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar producto
router.delete('/productos/:id', (req, res) => {
  try {
    const producto = productoRepository.eliminar(req.params.id);

    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const usuarioRepository = require('../repositories/usuarioRepository');

// Listar vendedores
router.get('/vendedores', (req, res) => {
  try {
    const vendedores = usuarioRepository.obtenerTodos()
      .filter(usuario => usuario.rol === 'vendedor')
      .map(usuario => ({
        id: usuario.id,
        nombre: usuario.nombres,
        email: usuario.correo,
        activo: usuario.estado
      }));

    res.json(vendedores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar vendedor
router.post('/vendedores', (req, res) => {
  try {
    const { nombre, email } = req.body;

    if (!nombre?.trim() || !email?.trim()) {
      return res.status(400).json({
        error: 'Nombre y correo son obligatorios'
      });
    }

    const usuarios = usuarioRepository.obtenerTodos();

    if (usuarios.some(u => u.correo.toLowerCase() === email.trim().toLowerCase())) {
      return res.status(409).json({
        error: 'El correo ya está registrado'
      });
    }

    const vendedor = usuarioRepository.crear({
      nombres: nombre.trim(),
      apellidos: '',
      correo: email.trim(),
      contraseña: '',
      rol: 'vendedor',
      estado: true
    });

    res.status(201).json({
      id: vendedor.id,
      nombre: vendedor.nombres,
      email: vendedor.correo,
      activo: vendedor.estado
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activar o desactivar vendedor
router.put('/vendedores/:id', (req, res) => {
  try {
    if (typeof req.body.activo !== 'boolean') {
      return res.status(400).json({
        error: 'El estado activo debe ser verdadero o falso'
      });
    }

    const usuario = usuarioRepository.obtenerPorId(req.params.id);

    if (!usuario || usuario.rol !== 'vendedor') {
      return res.status(404).json({
        error: 'Vendedor no encontrado'
      });
    }

    const actualizado = usuarioRepository.actualizar(req.params.id, {
      estado: req.body.activo
    });

    res.json({
      id: actualizado.id,
      nombre: actualizado.nombres,
      email: actualizado.correo,
      activo: actualizado.estado
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

 // Eliminar vendedor
router.delete('/vendedores/:id', (req, res) => {
  try {
    const id = Number(req.params.id);

    // Validar el ID recibido
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'ID de vendedor inválido'
      });
    }

    // Buscar al usuario antes de eliminarlo
    const usuario = usuarioRepository.obtenerPorId(id);

    if (!usuario || usuario.rol !== 'vendedor') {
      return res.status(404).json({
        error: 'Vendedor no encontrado'
      });
    }

    // Evitar eliminar vendedores con ventas registradas
    const contenido = fs.readFileSync(
      path.join(__dirname, '../../data/ventas.json'),
      'utf-8'
    );

    const ventas = JSON.parse(contenido);

    if (!Array.isArray(ventas)) {
      return res.status(500).json({
        error: 'No se pudo verificar el historial de ventas'
      });
    }

    const tieneVentas = ventas.some(
      (venta) => Number(venta.vendedorId) === id
    );

    if (tieneVentas) {
      return res.status(409).json({
        error: 'Este vendedor tiene ventas registradas. Puedes desactivarlo, pero no eliminarlo.'
      });
    }

    // Eliminar al vendedor
    const eliminado = usuarioRepository.eliminar(id);

    if (!eliminado) {
      return res.status(404).json({
        error: 'Vendedor no encontrado'
      });
    }

    res.json({
      mensaje: 'Vendedor eliminado correctamente',
      id: eliminado.id
    });

  } catch (error) {
    console.error('Error al eliminar vendedor:', error);

    res.status(500).json({
      error: 'No se pudo eliminar el vendedor'
    });
  }
});

const rutaVentas = path.join(__dirname, '../../data/ventas.json');

// REPORTE GENERAL DE VENTAS
router.get('/reportes', (req, res) => {
  try {
    const contenido = fs.readFileSync(rutaVentas, 'utf-8');
    const ventas = JSON.parse(contenido);

    if (!Array.isArray(ventas)) {
      return res.status(500).json({
        error: 'El archivo de ventas debe contener un arreglo'
      });
    }

    const reporte = {
      totalVentas: ventas.length,
      ingresoTotal: 0,
      ventasPorVendedor: {},
      productosVendidos: {}
    };

    ventas.forEach((venta) => {
      reporte.ingresoTotal += Number(venta.total) || 0;

      const vendedorId = venta.vendedorId;

      reporte.ventasPorVendedor[vendedorId] =
        (reporte.ventasPorVendedor[vendedorId] || 0) + 1;

      (venta.items || []).forEach((item) => {
        const nombre = item.nombre;
        const cantidad = Number(item.cantidad) || 0;
        const subtotal = Number(item.subtotal) || 0;

        if (!nombre) return;

        if (!reporte.productosVendidos[nombre]) {
          reporte.productosVendidos[nombre] = {
            cantidad: 0,
            total: 0
          };
        }

        reporte.productosVendidos[nombre].cantidad += cantidad;
        reporte.productosVendidos[nombre].total += subtotal;
      });
    });

    reporte.ingresoTotal = Number(
      reporte.ingresoTotal.toFixed(2)
    );

    res.json(reporte);
  } catch (error) {
    res.status(500).json({
      error: 'No se pudo generar el reporte de ventas'
    });
  }
});

module.exports = router;
