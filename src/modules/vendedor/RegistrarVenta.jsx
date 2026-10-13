export default function RegistrarVenta({
  carrito,
  enviando,
  onCambiarCantidad,
  onQuitar,
  onConfirmar,
}) {
  const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

  return (
    <div className="card p-3 mb-4">
      <h4 className="mb-3">Venta actual</h4>

      {carrito.length === 0 ? (
        <p className="text-muted mb-0">No hay productos agregados</p>
      ) : (
        <>
          <ul className="list-group list-group-flush mb-3">
            {carrito.map((item) => (
              <li
                key={item.productoId}
                className="list-group-item d-flex justify-content-between align-items-center px-0"
              >
                <div>
                  <div className="fw-semibold">{item.nombre}</div>
                  <small className="text-muted">S/ {item.precio.toFixed(2)} c/u</small>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => onCambiarCantidad(item.productoId, -1)}
                    >
                      −
                    </button>
                    <span className="btn btn-outline-secondary disabled">{item.cantidad}</span>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => onCambiarCantidad(item.productoId, 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="fw-semibold" style={{ minWidth: '70px', textAlign: 'right' }}>
                    S/ {(item.precio * item.cantidad).toFixed(2)}
                  </span>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => onQuitar(item.productoId)}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="d-flex justify-content-between align-items-center border-top pt-3">
            <span className="fs-5">Total: S/ {total.toFixed(2)}</span>
            <button className="btn btn-primary" onClick={onConfirmar} disabled={enviando}>
              {enviando ? 'Registrando...' : 'Confirmar venta'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}