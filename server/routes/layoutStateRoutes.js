// =============== Rotas de estado compartilhado do layout ===============

import { Router } from 'express';
import { readLayoutStateFromFile, writeLayoutStateToFile } from '../services/layoutFileService.js';

// --------------- Credenciais de admin ---------------
const ADMIN_USER = 'ADM';
const ADMIN_PASSWORD = '1234';

export function createLayoutStateRouter() {
    const router = Router();

    // --------------- Leitura pública (todos os visitantes) ---------------
    router.get('/layout-state', async (_req, res) => {
        const state = await readLayoutStateFromFile();
        res.json(state);
    });

    // --------------- Escrita protegida (apenas admin) ---------------
    router.post('/layout-state', async (req, res) => {
        const { user, password, payload } = req.body || {};

        if (user !== ADMIN_USER || password !== ADMIN_PASSWORD) {
            res.status(401).json({ success: false, message: 'Não autorizado' });
            return;
        }

        try {
            const saved = await writeLayoutStateToFile(payload || {});
            res.json({ success: true, data: saved });
        } catch (_error) {
            res.status(500).json({ success: false, message: 'Falha ao salvar layout' });
        }
    });

    return router;
}
