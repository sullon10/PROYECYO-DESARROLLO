import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerCatalogo } from '../services/clienteApi';

const destacadosIniciales = [
  { id: 'espresso', nombre: 'Café americano', categoria: 'Bebidas', precio: 5.5, stock: 20, tono: 'espresso' },
  { id: 'sandwich', nombre: 'Sandwich mixto', categoria: 'Comida', precio: 8, stock: 12, tono: 'caramelo' },
  { id: 'jugo', nombre: 'Jugo de naranja', categoria: 'Bebidas', precio: 6, stock: 15, tono: 'crema' }
];

function dinero(valor) {
  return `$${Number(valor).toFixed(2)}`;
}

export default function InicioPage() {
  const [destacados, setDestacados] = useState(destacadosIniciales);

  useEffect(() => {
    obtenerCatalogo()
      .then((productos) => {
        if (productos.length > 0) {
          setDestacados(productos.slice(0, 3).map((producto, indice) => ({
            ...producto,
            tono: ['espresso', 'caramelo', 'crema'][indice]
          })));
        }
      })
      .catch(() => {
        // La portada conserva sus productos de muestra si la API no está disponible.
      });
  }, []);

  return (
    <main className="showcase-home">
      <nav className="showcase-nav" aria-label="Navegación principal">
        <div className="showcase-nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/catalogo">Productos</Link>
          <a href="#historia">Nuestra historia</a>
        </div>
        <Link className="showcase-brand" to="/">
          <i className="bi bi-cup-hot-fill" aria-hidden="true"></i>
          <span>CafeteríaWeb</span>
        </Link>
        <div className="showcase-actions">
          <Link className="showcase-login-link" to="/login">Iniciar sesión</Link>
          <Link className="showcase-shop-button" to="/catalogo">Ver productos</Link>
        </div>
      </nav>

      <section className="showcase-hero">
        <div className="showcase-hero-heading">
          <span className="showcase-overline">INCLUYE TU PAUSA PERFECTA</span>
          <h1>Prepara<br />mejores<br /><em>momentos.</em></h1>
          <p>Un buen café, algo rico y un momento para ti. Descubre nuestra carta y elige tu próximo favorito.</p>
          <Link className="showcase-hero-button" to="/catalogo">
            Explorar productos <i className="bi bi-arrow-up-right" aria-hidden="true"></i>
          </Link>
        </div>
        <div className="showcase-hero-products" aria-label="Productos destacados">
          <span className="showcase-sparkle sparkle-one">✦</span>
          <span className="showcase-sparkle sparkle-two">✦</span>
          <div className="showcase-cup cup-left" aria-hidden="true"><i className="bi bi-cup-hot"></i></div>
          <div className="showcase-cup cup-center" aria-hidden="true"><i className="bi bi-cup-hot-fill"></i></div>
          <div className="showcase-cup cup-right" aria-hidden="true"><i className="bi bi-cup-straw"></i></div>
          <div className="showcase-steam steam-one"></div>
          <div className="showcase-steam steam-two"></div>
        </div>
      </section>

      <section className="showcase-products" id="productos">
        {destacados.map((producto) => (
          <article className={`showcase-product-card ${producto.tono}`} key={producto.id}>
            <div className="showcase-product-visual" aria-hidden="true">
              <i className={producto.tono === 'crema' ? 'bi bi-cup-straw' : 'bi bi-cup-hot-fill'}></i>
            </div>
            <div className="showcase-product-info">
              <span>{producto.categoria}</span>
              <h2>{producto.nombre}</h2>
              <strong>{dinero(producto.precio)}</strong>
              <small>{producto.stock > 0 ? 'Disponible hoy' : 'Agotado'}</small>
              <Link to="/catalogo">Ver producto <i className="bi bi-arrow-right" aria-hidden="true"></i></Link>
            </div>
          </article>
        ))}
      </section>

      <section className="showcase-stats" id="historia">
        <div>
          <span className="showcase-overline">CAFETERÍAWEB</span>
          <h2>Un sorbo<br /><em>a la vez.</em></h2>
        </div>
        <p>Creemos que los mejores momentos no necesitan demasiadas cosas. Solo algo bien preparado y el tiempo para disfrutarlo.</p>
        <div className="showcase-stat-list">
          <div><strong>12K+</strong><span>Clientes felices</span></div>
          <div><strong>50K+</strong><span>Pedidos preparados</span></div>
          <div><strong>78K+</strong><span>Tazas servidas</span></div>
        </div>
      </section>

      <footer className="showcase-footer">
        <span>CafeteríaWeb</span>
        <span>Tu pausa, a tu manera.</span>
        <Link to="/login">Iniciar sesión <i className="bi bi-arrow-up-right" aria-hidden="true"></i></Link>
      </footer>
    </main>
  );
}
