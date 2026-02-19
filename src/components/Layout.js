// =============== Componente Layout (estrutura base do Wiki) ===============

const ROOT_ID = 'app-root';

function getRoot() {
    let root = document.getElementById(ROOT_ID) || document.getElementById('app') || document.getElementById('root');
    if (!root) {
        root = document.createElement('div');
        root.id = ROOT_ID;
        document.body.prepend(root);
    }
    return root;
}

export function renderLayout({ serverName = 'AvaloriumOt', subtitle = 'Seja bem-vindo' } = {}) {
    const root = getRoot();
    root.innerHTML = `
    <aside id="sidebar" class="sidebar collapsed" aria-hidden="true">
      <button id="sidebarToggle" class="sidebar-toggle" aria-label="Abrir navegação">
        <span class="hamburger" aria-hidden="true"></span>
      </button>
      <nav class="sidebar-nav" aria-label="Navegação principal">
        <ul>
          <!-- Navegação vazia; preencher dinamicamente -->
        </ul>
      </nav>
    </aside>

    <div class="page-wrapper">
      <header class="app-header">
        <div class="header-left">
          <img src="src/assets/logo.svg" alt="${serverName} logo" class="logo" />
        </div>
        <div class="header-right">
          <!-- Espaço para ações futuras -->
        </div>
      </header>

      <main id="main" class="main-content">
        <section class="hero" id="hero">
          <h1 class="server-title">${serverName}</h1>
          <p class="server-subtitle">${subtitle}</p>
        </section>

        <section id="page-content" class="page-content">
          <!-- Conteúdo das páginas será inserido aqui -->
        </section>
      </main>

      <footer class="app-footer">
        <div class="footer-inner">© ${new Date().getFullYear()} ${serverName}</div>
      </footer>
    </div>
    `;

    // Inicializa comportamento interativo da sidebar
    _initSidebar();
}

function _initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    if (!sidebar || !toggle) return;

    const toggleSidebar = () => {
        const isOpen = sidebar.classList.toggle('open');
        sidebar.classList.toggle('collapsed', !isOpen);
        sidebar.setAttribute('aria-hidden', String(!isOpen));
    };

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            toggleSidebar();
        }
    });

    document.addEventListener('click', (e) => {
        if (!sidebar.classList.contains('open')) return;
        const target = e.target;
        if (!sidebar.contains(target) && !toggle.contains(target)) {
            toggleSidebar();
        }
    });
}

export function setMainContent(html) {
    const container = document.getElementById('page-content');
    if (container) container.innerHTML = html;
}
