import { useCallback, useEffect, useState } from 'react';
import { obtenerPedidos } from '../../services/api';

// Carga los pedidos y los refresca solos cada cierto tiempo
export default function usePedidos(intervaloMs = 15000) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    try {
      setPedidos(await obtenerPedidos());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
    const intervalo = setInterval(recargar, intervaloMs);
    return () => clearInterval(intervalo);
  }, [recargar, intervaloMs]);

  return { pedidos, cargando, error, recargar };
}