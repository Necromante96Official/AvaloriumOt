// =============== PÁGINA INICIAL ===============

import { renderLayout, setMainContent } from '../components/Layout.js';

// Renderiza o layout com título central destacado (não modal)
renderLayout({ serverName: 'AvaloriumOt', subtitle: 'Seja bem-vindo' });

// Estrutura vazia da home — apenas placeholder para conteúdo
setMainContent(`
	<div class="home-structure">
		<!-- Estrutura preparada para conteúdo da wiki (vazia) -->
	</div>
`);

