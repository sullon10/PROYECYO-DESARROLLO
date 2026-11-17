export default function RegistrarVenta({
  carrito,
  enviando,
  onCambiarCantidad,
  onQuitar,
  onVaciar,
  onConfirmar,
}) {
  const unidades = carrito.reduce((suma, item) => suma + item.cantidad, 0);
  const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

  return (
    <div className="sticky-panel">
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">
              <i className="bi bi-receipt me-2"></i>Venta actual
              {unidades > 0 && (
                <span className="badge rounded-pill text-bg-dark ms-2 fs-6">{unidades}</span>
              )}
            </h4>
            {carrito.length > 0 && (
              <button
                className="btn btn-link btn-sm text-danger text-decoration-none p-0"
                onClick={onVaciar}
                disabled={enviando}
              >
                Vaciar
              </button>
            )}
          </div>

          {carrito.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-cart3"></i>
              Agrega productos desde el catálogo para armar la venta.
            </div>
          ) : (
            <>
              <ul className="list-group list-group-flush mb-3">
                {carrito.map((item) => (
                  <li key={item.productoId} className="list-group-item px-0">
                    <div className="d-flex justify-content-between">
                      <span className="fw-semibold">{item.nombre}</span>
                      <span className="fw-semibold">
                        S/ {(item.precio * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <small className="text-muted">S/ {item.precio.toFixed(2)} c/u</small>
                      <div className="d-flex align-items-center gap-2">
                        <div className="qty-stepper qty-sm">
                          <button
                            type="button"
                            onClick={() => onCambiarCantidad(item.productoId, -1)}
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <span>{item.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => onCambiarCantidad(item.productoId, 1)}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => onQuitar(item.productoId)}
                          title="Quitar de la venta"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="d-flex justify-content-between align-items-end border-top pt-3 mb-3">
                <span className="text-muted">Total a cobrar</span>
                <span className="total-line">S/ {total.toFixed(2)}</span>
              </div>

              <button
                className="btn btn-primary btn-lg w-100"
                onClick={onConfirmar}
                disabled={enviando}
              >
                {enviando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Registrando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-2"></i>Confirmar venta
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}