// =============== Servidor principal (estático + API) ===============

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLayoutStateRouter } from './routes/layoutStateRoutes.js';

// --------------- Configurações básicas ---------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8000);

const app = express();

// --------------- Middlewares globais ---------------
app.use(express.json({ limit: '1mb' }));

// --------------- Rotas de API ---------------
app.use('/api', createLayoutStateRouter());

// --------------- Conteúdo estático ---------------
app.use(express.static(ROOT_DIR));

// --------------- Fallback para index ---------------
app.get('*', (_req, res) => {
    res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`AvaloriumOt Wiki rodando em http://localhost:${PORT}`);
});
