const express = require('express');
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/categorias
router.get('/', (req, res) => {
  const db = getDb();
  const categorias = db.prepare('SELECT id, nome FROM categorias ORDER BY nome').all();
  return res.json(categorias);
});

// POST /api/categorias
router.post('/', (req, res) => {
  const { nome } = req.body;
  if (!nome || nome.trim().length === 0) {
    return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
  }

  const db = getDb();
  try {
    const result = db.prepare('INSERT INTO categorias (nome) VALUES (?)').run(nome.trim());
    return res.status(201).json({ id: result.lastInsertRowid, nome: nome.trim() });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Categoria já existe.' });
    }
    throw err;
  }
});

module.exports = router;
