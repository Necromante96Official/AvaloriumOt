// =============== Serviço de persistência do layout ===============

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// --------------- Constantes de arquivo ---------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LAYOUT_FILE_PATH = path.resolve(__dirname, '../../src/data/layout-state.json');

// --------------- Estrutura padrão ---------------
const DEFAULT_LAYOUT_STATE = {
    version: 1,
    savedAt: 0,
    items: {}
};

// --------------- Leitura segura ---------------
export async function readLayoutStateFromFile() {
    try {
        const raw = await readFile(LAYOUT_FILE_PATH, { encoding: 'utf8' });
        const parsed = JSON.parse(raw);

        if (!parsed || typeof parsed !== 'object' || typeof parsed.items !== 'object') {
            return { ...DEFAULT_LAYOUT_STATE };
        }

        return parsed;
    } catch (_error) {
        return { ...DEFAULT_LAYOUT_STATE };
    }
}

// --------------- Escrita segura ---------------
export async function writeLayoutStateToFile(payload) {
    const normalized = {
        version: 1,
        savedAt: Date.now(),
        items: payload && typeof payload.items === 'object' ? payload.items : {}
    };

    await writeFile(LAYOUT_FILE_PATH, `${JSON.stringify(normalized, null, 2)}\n`, { encoding: 'utf8' });

    return normalized;
}
