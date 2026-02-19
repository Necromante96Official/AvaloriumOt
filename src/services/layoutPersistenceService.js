// =============== Serviço de persistência compartilhada (API) ===============

import { EDITOR_API_ENDPOINTS } from '../config/editorApi.js';

// --------------- Buscar estado salvo global ---------------
export async function fetchSharedLayoutState() {
    const response = await fetch(EDITOR_API_ENDPOINTS.layoutState, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Falha ao buscar layout compartilhado');
    }

    return response.json();
}

// --------------- Salvar estado global ---------------
export async function saveSharedLayoutState({ user, password, payload }) {
    const response = await fetch(EDITOR_API_ENDPOINTS.layoutState, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ user, password, payload })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
        throw new Error(result.message || 'Falha ao salvar layout no servidor');
    }

    return result.data;
}
