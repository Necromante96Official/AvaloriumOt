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
          <!-- Logo pequena à esquerda do cabeçario -->
          <img src="src/assets/logo-avalorium.png" alt="Logo Avalorium" class="header-logo" />
        </div>
        <div class="header-center">
          <div class="search-container">
            <input id="headerSearch" class="search-input" type="search" placeholder="" aria-label="Buscar" />
            <div id="searchOverlay" class="search-overlay" aria-hidden="true"></div>
          </div>
        </div>
        <div class="header-right"></div>
      </header>

      <main id="main" class="main-content">
        <section class="hero" id="hero">
          <h1 class="server-title">${serverName}</h1>
          <p class="server-subtitle">${subtitle}</p>
          <!-- Imagem central abaixo do título (logotipo principal) -->
          <div class="hero-image">
            <img src="src/assets/logotipo-avalorium.jpeg" alt="Logotipo Avalorium" />
          </div>
        </section>

        <section id="page-content" class="page-content"></section>
      </main>

      <footer class="app-footer"><div class="footer-inner">© ${new Date().getFullYear()} ${serverName}</div></footer>
    </div>
    `;

    // Inicializa comportamentos interativos
    _initSidebar();
    _initSearch();
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

function _initSearch() {
    const input = document.getElementById('headerSearch');
    const overlay = document.getElementById('searchOverlay');
    if (!input || !overlay) return;

    const placeholderText = 'Buscar...';

    function render(text) {
        overlay.innerHTML = '';
        // se não há texto, mostra placeholder estilizado
        if (!text) {
            const span = document.createElement('span');
            span.className = 'placeholder';
            span.textContent = placeholderText;
            overlay.appendChild(span);
            // caret
            const caret = document.createElement('span');
            caret.className = 'search-caret';
            overlay.appendChild(caret);
            return;
        }

        // Cria spans por caractere com delay suave para animação fluida
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const span = document.createElement('span');
            span.className = 'letter';
            span.textContent = ch === ' ' ? '\u00A0' : ch;
            // delay menor e mais linear para evitar efeito "bruto"
            span.style.animationDelay = `${i * 28}ms`;
            overlay.appendChild(span);
        }

        // caret posicionado após o último caractere (custom caret)
        const caret = document.createElement('span');
        caret.className = 'search-caret';
        overlay.appendChild(caret);
    }

    input.addEventListener('input', (e) => render(e.target.value));
    input.addEventListener('focus', () => overlay.classList.add('focus'));
    input.addEventListener('blur', () => overlay.classList.remove('focus'));

    // render initial
    render(input.value || '');
}
