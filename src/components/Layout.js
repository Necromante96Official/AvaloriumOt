// =============== Componente Layout (estrutura base do Wiki) ===============

export function renderLayout({ pageTitle = '' } = {}) {
    const root = document.getElementById('root');
    if (!root) return;

    root.innerHTML = `
    <div class="site-shell">
      <header class="site-header">
        <div class="header-inner">
          <a class="logo" href="#">
            <img src="src/assets/logo.svg" alt="AvaloriumOt" class="logo-img"/>
            <span class="logo-text">AvaloriumOt</span>
          </a>

          <nav class="top-nav" aria-label="Navegação principal">
            <a href="#" class="nav-link">Início</a>
            <a href="#" class="nav-link">Regras</a>
            <a href="#" class="nav-link">Spells</a>
            <a href="#" class="nav-link">Creatures</a>
          </nav>

          <div class="header-actions">
            <div class="search-lang">
              <input class="search-input" type="search" placeholder="Pesquisar" aria-label="Pesquisar" />
              <select class="lang-select" aria-label="Idioma">
                <option>pt-BR</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div class="site-body">
        <aside class="site-sidebar" aria-label="Barra lateral">
          <div class="sidebar-inner">
            <div class="sidebar-block">
              <h3 class="sidebar-title">Navegação</h3>
              <ul class="sidebar-list">
                <li><a href="#" class="sidebar-link">Página Inicial</a></li>
                <li><a href="#" class="sidebar-link">Regras</a></li>
                <li><a href="#" class="sidebar-link">Spells</a></li>
                <li><a href="#" class="sidebar-link">Creatures</a></li>
              </ul>
            </div>
            <div class="sidebar-block">
              <h3 class="sidebar-title">Ferramentas</h3>
              <ul class="sidebar-list">
                <li><a href="#" class="sidebar-link">Criar página</a></li>
              </ul>
            </div>
          </div>
        </aside>

        <main class="site-content">
          <div class="content-inner">
            <div class="page-meta">
              <div class="breadcrumbs">Início</div>
              <div class="page-actions">
                <button class="btn btn-ghost">Editar</button>
                <button class="btn btn-ghost">Histórico</button>
              </div>
            </div>

            <article class="page-article">
              <header class="article-header">
                <h1 class="page-title">${pageTitle}</h1>
              </header>

              <nav class="page-toc" aria-label="Sumário da página">
                <!-- TOC vazia (estrutura) -->
              </nav>

              <section class="page-body empty">
                <!-- Conteúdo vazio — apenas estrutura do layout -->
              </section>
            </article>
          </div>
        </main>
      </div>

      <footer class="site-footer">
        <div class="footer-inner">© ${new Date().getFullYear()} AvaloriumOt</div>
      </footer>
    </div>
    `;

    // Interatividade mínima: voltar ao início ao clicar no logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            renderLayout({ pageTitle: '' });
        });
    }
}
