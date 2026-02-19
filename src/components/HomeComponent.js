// =============== Componente Home ===============

export function renderHome() {
    const root = document.getElementById('root');
    root.innerHTML = `
        <div class="wiki-container">
            <h1 class="wiki-title">AvaloriumOt</h1>
            <p class="wiki-welcome">Seja bem-vindo ao Wiki oficial do servidor!</p>
        </div>
    `;
}
