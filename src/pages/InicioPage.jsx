import { Link } from 'react-router-dom';

const beneficios = [
  {
    icono: 'bi-grid-3x3-gap',
    titulo: 'Catálogo claro',
    texto: 'Consulta bebidas y comidas con precio, categoría y disponibilidad.'
  },
  {
    icono: 'bi-bag-check',
    titulo: 'Pedidos sencillos',
    texto: 'Arma tu pedido desde el catálogo y revisa su estado en un solo lugar.'
  },
  {
    icono: 'bi-clock-history',
    titulo: 'Seguimiento',
    texto: 'Conserva el código de tu pedido y consulta sus actualizaciones.'
  }
];

export default function InicioPage() {
  return (
    <main className="public-home">
      <nav className="public-nav" aria-label="Navegación principal">
        <Link className="public-brand" to="/">
          <i className="bi bi-cup-hot-fill" aria-hidden="true"></i>
          <span>CafeteríaWeb</span>
        </Link>
        <div className="public-nav-actions">
          <a href="#propuesta">Conócenos</a>
          <Link className="public-login-link" to="/login">Iniciar sesión</Link>
        </div>
      </nav>

      <section className="public-hero">
        <div className="public-hero-copy">
          <span className="public-kicker">CAFÉ, COMIDA Y BUEN MOMENTO</span>
          <h1>Tu pausa favorita empieza aquí.</h1>
          <p>
            Descubre el catálogo de CafeteríaWeb, elige tus productos y prepara
            tu próximo pedido con una experiencia simple y cercana.
          </p>
          <div className="public-hero-actions">
            <Link className="public-primary-action" to="/catalogo">
              Ver catálogo <i className="bi bi-arrow-up-right" aria-hidden="true"></i>
            </Link>
            <a className="public-secondary-action" href="#propuesta">Ver cómo funciona</a>
          </div>
        </div>
        <div className="public-hero-art" aria-label="Ilustración decorativa de una taza de café">
          <div className="public-sun"></div>
          <i className="bi bi-cup-hot public-cup" aria-hidden="true"></i>
          <span className="public-art-note">hecho para tu pausa</span>
        </div>
      </section>

      <section className="public-intro" id="propuesta">
        <div>
          <span className="public-kicker">UNA EXPERIENCIA MÁS SIMPLE</span>
          <h2>Todo lo que necesitas para pedir mejor.</h2>
        </div>
        <p>
          Un espacio público para conocer la cafetería antes de entrar a tu
          cuenta, con tus pedidos protegidos cuando decidas continuar.
        </p>
      </section>

      <section className="public-benefits" aria-label="Beneficios de CafeteríaWeb">
        {beneficios.map((beneficio) => (
          <article className="public-benefit" key={beneficio.titulo}>
            <i className={`bi ${beneficio.icono}`} aria-hidden="true"></i>
            <h3>{beneficio.titulo}</h3>
            <p>{beneficio.texto}</p>
          </article>
        ))}
      </section>

      <footer className="public-footer">
        <span>CafeteríaWeb</span>
        <span>Tu pausa, a tu manera.</span>
      </footer>
    </main>
  );
}
