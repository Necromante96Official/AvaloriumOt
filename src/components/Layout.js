// =============== Componente Layout (estrutura base do Wiki) ===============

import { fetchSharedLayoutState, saveSharedLayoutState } from '../services/layoutPersistenceService.js';

const ROOT_ID = 'app-root';
const ADMIN_USER = 'ADM';
const ADMIN_PASSWORD = '1234';

const editorState = {
    enabled: false,
    authOpen: false,
    selectedElement: null,
    moveMode: true,
    textMode: false,
    dragData: null,
    handlersBound: false,
    adminSession: null
};

const elementTransformMap = new WeakMap();

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

    <div id="editorAuthModal" class="editor-auth-modal" aria-hidden="true" hidden>
      <div class="editor-auth-box" role="dialog" aria-modal="true" aria-labelledby="editorAuthTitle">
        <h2 id="editorAuthTitle" class="editor-auth-title">Identificação de Administrador</h2>
        <form id="editorAuthForm" class="editor-auth-form" autocomplete="off">
          <input id="editorUser" class="editor-auth-input" type="text" placeholder="Usuário" />
          <input id="editorPass" class="editor-auth-input" type="password" placeholder="Senha" />
          <button id="editorAuthSubmit" class="editor-auth-submit" type="submit">Entrar</button>
        </form>
        <p id="editorAuthMessage" class="editor-auth-message">Pressione Ctrl + F9 para abrir este acesso.</p>
      </div>
    </div>

    <div id="editorTools" class="editor-tools" hidden>
      <div class="editor-tools-title">Ferramentas de edição</div>
      <div class="editor-tools-row">
        <button id="editorMoveToggle" class="editor-tool-btn active" type="button">Mover</button>
        <button id="editorTextToggle" class="editor-tool-btn" type="button">Texto</button>
      </div>
      <div class="editor-tools-row">
        <button id="editorScaleDown" class="editor-tool-btn" type="button">-</button>
        <button id="editorScaleUp" class="editor-tool-btn" type="button">+</button>
        <button id="editorReset" class="editor-tool-btn" type="button">Resetar</button>
      </div>
      <div class="editor-tools-row">
        <button id="editorSave" class="editor-tool-btn" type="button">Salvar</button>
        <button id="editorRestore" class="editor-tool-btn" type="button">Restaurar</button>
        <button id="editorClear" class="editor-tool-btn" type="button">Limpar</button>
      </div>
      <div id="editorToolsHint" class="editor-tools-hint">Selecione algo e arraste para mover. Use + e - para tamanho.</div>
      <button id="editorExit" class="editor-exit-btn" type="button">Sair da edição</button>
    </div>
    `;

    // Assegura que o painel de edição comece oculto (defesa extra)
    const _toolsElem = document.getElementById('editorTools');
    if (_toolsElem) {
        _toolsElem.hidden = true;
        _toolsElem.style.display = 'none';
    }

    // Inicializa comportamentos interativos
    _initSidebar();
    _initSearch();
    _initEditorAccess();
    _registerEditorTargets();
    _restoreLayoutState().catch(() => {
        // Ignora falhas silenciosas no carregamento inicial
    });
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
    if (container) {
        container.innerHTML = html;
        _registerEditorTargets();
        _restoreLayoutState().catch(() => {
            // Ignora falhas silenciosas no carregamento inicial
        });
    }
}

function _initSearch() {
    const input = document.getElementById('headerSearch');
    const overlay = document.getElementById('searchOverlay');
    if (!input || !overlay) return;

    const placeholderText = 'Buscar...';

    function render(text) {
        overlay.innerHTML = '';
        if (!text) {
            const span = document.createElement('span');
            span.className = 'placeholder';
            span.textContent = placeholderText;
            overlay.appendChild(span);
            const caret = document.createElement('span');
            caret.className = 'search-caret';
            overlay.appendChild(caret);
            return;
        }

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const span = document.createElement('span');
            span.className = 'letter';
            span.textContent = ch === ' ' ? '\u00A0' : ch;
            span.style.animationDelay = `${i * 28}ms`;
            overlay.appendChild(span);
        }

        const caret = document.createElement('span');
        caret.className = 'search-caret';
        overlay.appendChild(caret);
    }

    input.addEventListener('input', (e) => render(e.target.value));
    input.addEventListener('focus', () => overlay.classList.add('focus'));
    input.addEventListener('blur', () => overlay.classList.remove('focus'));

    render(input.value || '');
}

function _initEditorAccess() {
    const modal = document.getElementById('editorAuthModal');
    const form = document.getElementById('editorAuthForm');
    const userInput = document.getElementById('editorUser');
    const passInput = document.getElementById('editorPass');
    const message = document.getElementById('editorAuthMessage');

    const tools = document.getElementById('editorTools');
    const moveToggle = document.getElementById('editorMoveToggle');
    const textToggle = document.getElementById('editorTextToggle');
    const scaleDown = document.getElementById('editorScaleDown');
    const scaleUp = document.getElementById('editorScaleUp');
    const resetBtn = document.getElementById('editorReset');
    const saveBtn = document.getElementById('editorSave');
    const restoreBtn = document.getElementById('editorRestore');
    const clearBtn = document.getElementById('editorClear');
    const exitBtn = document.getElementById('editorExit');

    if (!modal || !form || !userInput || !passInput || !message || !tools || !moveToggle || !textToggle || !scaleDown || !scaleUp || !resetBtn || !saveBtn || !restoreBtn || !clearBtn || !exitBtn) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const userValue = userInput.value.trim();
        const passValue = passInput.value.trim();

        if (userValue === ADMIN_USER && passValue === ADMIN_PASSWORD) {
            editorState.adminSession = { user: userValue, password: passValue };
            message.textContent = 'Acesso autorizado. Transição concluída...';
            modal.classList.remove('error');
            modal.classList.add('success');

            window.setTimeout(() => {
                _closeEditorAuthModal();
                _enableEditorMode();
            }, 700);
            return;
        }

        modal.classList.remove('success');
        modal.classList.add('error');
        editorState.adminSession = null;
        message.textContent = 'Identificação inválida. Usuário ou senha incorretos.';
    });

    moveToggle.addEventListener('click', () => {
        editorState.moveMode = true;
        moveToggle.classList.add('active');
        textToggle.classList.remove('active');
        _setEditorHint('Modo mover ativo: arraste o elemento selecionado.');
    });

    textToggle.addEventListener('click', () => {
        editorState.textMode = !editorState.textMode;
        textToggle.classList.toggle('active', editorState.textMode);

        if (editorState.selectedElement) {
            editorState.selectedElement.contentEditable = editorState.textMode ? 'true' : 'false';
        }

        _setEditorHint(editorState.textMode ? 'Modo texto ativo: clique no texto e edite.' : 'Modo texto desativado.');
    });

    scaleDown.addEventListener('click', () => _scaleSelectedElement(-0.08));
    scaleUp.addEventListener('click', () => _scaleSelectedElement(0.08));
    resetBtn.addEventListener('click', _resetSelectedElementTransform);
    saveBtn.addEventListener('click', async () => {
        await _saveLayoutState();
    });
    restoreBtn.addEventListener('click', async () => {
        await _restoreLayoutState(true);
    });
    clearBtn.addEventListener('click', async () => {
        await _clearSavedLayoutState();
    });

    exitBtn.addEventListener('click', () => {
        _disableEditorMode();
        _setEditorHint('Modo edição desativado.');
    });

    if (!editorState.handlersBound) {
        document.addEventListener('keydown', _handleEditorHotkeys);
        document.addEventListener('click', _handleEditorSelection, true);
        document.addEventListener('mousedown', _handleEditorDragStart);
        document.addEventListener('mousemove', _handleEditorDragging);
        document.addEventListener('mouseup', _handleEditorDragEnd);
        document.addEventListener('input', _handleEditorTextInput, true);
        editorState.handlersBound = true;
    }
}

function _handleEditorHotkeys(e) {
    if (e.ctrlKey && e.key === 'F9') {
        e.preventDefault();
        _openEditorAuthModal();
        return;
    }

    if (!editorState.enabled || !editorState.selectedElement) return;

    const target = e.target;
    if (target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

    const step = 8;
    if (e.key === 'ArrowUp') _moveSelectedElement(0, -step);
    if (e.key === 'ArrowDown') _moveSelectedElement(0, step);
    if (e.key === 'ArrowLeft') _moveSelectedElement(-step, 0);
    if (e.key === 'ArrowRight') _moveSelectedElement(step, 0);
    if (e.key === '+' || e.key === '=') _scaleSelectedElement(0.08);
    if (e.key === '-') _scaleSelectedElement(-0.08);
}

function _handleEditorSelection(e) {
    if (!editorState.enabled) return;

    const tools = document.getElementById('editorTools');
    const modal = document.getElementById('editorAuthModal');
    const target = e.target;

    if (!(target instanceof HTMLElement)) return;
    if (tools && tools.contains(target)) return;
    if (modal && modal.contains(target)) return;

    const selectable = target.closest('[data-editor-target="true"]');
    if (!selectable) return;

    _selectEditorElement(selectable);
}

function _handleEditorDragStart(e) {
    if (!editorState.enabled || !editorState.moveMode || !editorState.selectedElement) return;

    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (!editorState.selectedElement.contains(target)) return;
    if (target.closest('#editorTools')) return;

    editorState.dragData = {
        startX: e.clientX,
        startY: e.clientY,
        startTransform: { ..._getElementTransform(editorState.selectedElement) }
    };
}

function _handleEditorDragging(e) {
    if (!editorState.enabled || !editorState.dragData || !editorState.selectedElement) return;

    const deltaX = e.clientX - editorState.dragData.startX;
    const deltaY = e.clientY - editorState.dragData.startY;
    const transform = _getElementTransform(editorState.selectedElement);

    transform.x = editorState.dragData.startTransform.x + deltaX;
    transform.y = editorState.dragData.startTransform.y + deltaY;

    _applyElementTransform(editorState.selectedElement);
}

function _handleEditorDragEnd() {
    editorState.dragData = null;
}

function _handleEditorTextInput(e) {
    if (!editorState.enabled || !editorState.textMode) return;

    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const editable = target.closest('[data-editor-target="true"]');
    if (!editable || !(editable instanceof HTMLElement)) return;

    editable.dataset.editorTextEdited = 'true';
}

function _openEditorAuthModal() {
    if (editorState.enabled) return;

    const modal = document.getElementById('editorAuthModal');
    const userInput = document.getElementById('editorUser');
    const passInput = document.getElementById('editorPass');
    const message = document.getElementById('editorAuthMessage');

    if (!modal || !userInput || !passInput || !message) return;

    editorState.authOpen = true;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.remove('error', 'success');
    modal.classList.add('open');
    message.textContent = 'Informe usuário e senha para habilitar a edição.';

    userInput.value = '';
    passInput.value = '';
    userInput.focus();
}

function _closeEditorAuthModal() {
    const modal = document.getElementById('editorAuthModal');
    if (!modal) return;

    editorState.authOpen = false;
    modal.classList.remove('open', 'error', 'success');
    modal.setAttribute('aria-hidden', 'true');
    modal.hidden = true;
}

function _enableEditorMode() {
    if (editorState.enabled) return;

    const tools = document.getElementById('editorTools');
    if (!tools) return;

    editorState.enabled = true;
    editorState.moveMode = true;
    editorState.textMode = false;

    document.body.classList.add('editor-mode-enabled');
    tools.hidden = false;
    tools.style.display = '';

    _registerEditorTargets();
    _setEditorHint('Modo edição ativo: selecione, arraste e redimensione elementos.');
}

function _disableEditorMode() {
    const tools = document.getElementById('editorTools');

    editorState.enabled = false;
    editorState.moveMode = true;
    editorState.textMode = false;
    editorState.dragData = null;

    if (editorState.selectedElement) {
        editorState.selectedElement.classList.remove('editor-selected');
        editorState.selectedElement.contentEditable = 'false';
        editorState.selectedElement = null;
    }

    if (tools) {
        tools.hidden = true;
        tools.style.display = 'none';
    }
    document.body.classList.remove('editor-mode-enabled');
}

function _registerEditorTargets() {
    const wrapper = document.querySelector('.page-wrapper');
    if (!wrapper) return;

    const elements = wrapper.querySelectorAll('*');
    let editorKeyIndex = 0;

    elements.forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        if (el.closest('#editorTools') || el.closest('#editorAuthModal')) return;
        if (el.id === 'headerSearch' || el.id === 'searchOverlay') return;
        editorKeyIndex += 1;
        el.setAttribute('data-editor-target', 'true');
        el.setAttribute('data-editor-key', `k-${editorKeyIndex}`);
    });
}

function _selectEditorElement(element) {
    if (!(element instanceof HTMLElement)) return;

    if (editorState.selectedElement && editorState.selectedElement !== element) {
        editorState.selectedElement.classList.remove('editor-selected');
        editorState.selectedElement.contentEditable = 'false';
    }

    editorState.selectedElement = element;
    editorState.selectedElement.classList.add('editor-selected');
    editorState.selectedElement.contentEditable = editorState.textMode ? 'true' : 'false';

    _setEditorHint(`Selecionado: <${element.tagName.toLowerCase()}>.${element.className || 'sem-classe'}`);
}

function _setEditorHint(text) {
    const hint = document.getElementById('editorToolsHint');
    if (hint) hint.textContent = text;
}

function _getElementTransform(element) {
    if (!elementTransformMap.has(element)) {
        elementTransformMap.set(element, { x: 0, y: 0, scale: 1 });
    }
    return elementTransformMap.get(element);
}

function _applyElementTransform(element) {
    const transform = _getElementTransform(element);
    element.style.translate = `${transform.x}px ${transform.y}px`;
    element.style.scale = `${transform.scale}`;
}

function _moveSelectedElement(deltaX, deltaY) {
    if (!editorState.selectedElement) return;

    const transform = _getElementTransform(editorState.selectedElement);
    transform.x += deltaX;
    transform.y += deltaY;
    _applyElementTransform(editorState.selectedElement);
}

function _scaleSelectedElement(deltaScale) {
    if (!editorState.selectedElement) return;

    const transform = _getElementTransform(editorState.selectedElement);
    const next = Math.min(2.8, Math.max(0.35, transform.scale + deltaScale));
    transform.scale = Number(next.toFixed(2));
    _applyElementTransform(editorState.selectedElement);
}

function _resetSelectedElementTransform() {
    if (!editorState.selectedElement) return;

    elementTransformMap.set(editorState.selectedElement, { x: 0, y: 0, scale: 1 });
    _applyElementTransform(editorState.selectedElement);
    _setEditorHint('Transformações do elemento selecionado foram resetadas.');
}

async function _saveLayoutState() {
    const wrapper = document.querySelector('.page-wrapper');
    if (!wrapper) return;

    if (!editorState.adminSession) {
        _setEditorHint('Acesso admin não encontrado. Entre novamente com Ctrl + F9.');
        return;
    }

    const nodes = wrapper.querySelectorAll('[data-editor-target="true"]');
    const items = {};

    nodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;

        const key = node.dataset.editorKey;
        if (!key) return;

        const transform = elementTransformMap.get(node);
        const hasTransform = Boolean(transform && (transform.x !== 0 || transform.y !== 0 || transform.scale !== 1));
        const hasTextEdit = node.dataset.editorTextEdited === 'true';

        if (!hasTransform && !hasTextEdit) return;

        items[key] = {};

        if (hasTransform && transform) {
            items[key].transform = {
                x: transform.x,
                y: transform.y,
                scale: transform.scale
            };
        }

        if (hasTextEdit) {
            items[key].html = node.innerHTML;
        }
    });

    const payload = {
        version: 1,
        savedAt: Date.now(),
        items
    };

    try {
        await saveSharedLayoutState({
            user: editorState.adminSession.user,
            password: editorState.adminSession.password,
            payload
        });
        _setEditorHint('Layout salvo no arquivo do servidor e aplicado para todos os visitantes.');
    } catch (_error) {
        _setEditorHint('Não foi possível salvar no servidor. Verifique se o backend está rodando.');
    }
}

async function _clearSavedLayoutState() {
    if (!editorState.adminSession) {
        _setEditorHint('Acesso admin não encontrado. Entre novamente com Ctrl + F9.');
        return;
    }

    try {
        await saveSharedLayoutState({
            user: editorState.adminSession.user,
            password: editorState.adminSession.password,
            payload: { version: 1, savedAt: Date.now(), items: {} }
        });
        _setEditorHint('Layout salvo limpo. Restaurando padrão...');
        await _restoreLayoutState(true);
    } catch (_error) {
        _setEditorHint('Falha ao limpar layout salvo. Verifique o servidor.');
    }
}

async function _restoreLayoutState(showFeedback = false) {
    let parsed = null;
    try {
        parsed = await fetchSharedLayoutState();
    } catch (_error) {
        if (showFeedback) _setEditorHint('Não foi possível carregar o layout do servidor.');
        return false;
    }

    if (!parsed || typeof parsed !== 'object' || !parsed.items || typeof parsed.items !== 'object') {
        if (showFeedback) _setEditorHint('Formato de layout salvo não suportado.');
        return false;
    }

    const wrapper = document.querySelector('.page-wrapper');
    if (!wrapper) return false;

    let restoredCount = 0;
    Object.entries(parsed.items).forEach(([key, item]) => {
        if (!item || typeof item !== 'object') return;

        const element = wrapper.querySelector(`[data-editor-key="${key}"]`);
        if (!(element instanceof HTMLElement)) return;

        if (item.transform && typeof item.transform === 'object') {
            const x = Number(item.transform.x) || 0;
            const y = Number(item.transform.y) || 0;
            const scaleRaw = Number(item.transform.scale);
            const scale = Number.isFinite(scaleRaw) ? Math.min(2.8, Math.max(0.35, scaleRaw)) : 1;

            elementTransformMap.set(element, { x, y, scale });
            _applyElementTransform(element);
            restoredCount += 1;
        }

        if (typeof item.html === 'string') {
            element.innerHTML = item.html;
            element.dataset.editorTextEdited = 'true';
            restoredCount += 1;
        }
    });

    if (showFeedback) {
        _setEditorHint(restoredCount > 0 ? 'Layout restaurado com sucesso.' : 'Nenhuma modificação compatível foi restaurada.');
    }

    return restoredCount > 0;
}
