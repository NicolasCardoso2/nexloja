const express = require('express');
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/configuracao
router.get('/', (req, res) => {
  const db = getDb();
  const config = db.prepare('SELECT * FROM configuracao_loja LIMIT 1').get();
  if (!config) return res.status(404).json({ error: 'Configuração não encontrada.' });
  return res.json(config);
});

// PUT /api/configuracao
router.put('/', (req, res) => {
  const { nome_loja, cnpj, telefone, email, endereco, logo_path, tema, moeda, meta_diaria } = req.body;
  if (!nome_loja) return res.status(400).json({ error: 'nome_loja é obrigatório.' });
  if (tema && tema !== 'light' && tema !== 'dark') {
    return res.status(400).json({ error: 'Tema inválido. Use light ou dark.' });
  }

  const db = getDb();
  const existe = db.prepare('SELECT id FROM configuracao_loja LIMIT 1').get();
  const metaDiaria = meta_diaria !== undefined ? Number(meta_diaria) || 0 : null;

  if (existe) {
    db.prepare(`
      UPDATE configuracao_loja SET
        nome_loja = ?, cnpj = ?, telefone = ?, email = ?,
        endereco = ?, logo_path = ?, tema = ?, moeda = ?, meta_diaria = COALESCE(?, meta_diaria)
      WHERE id = ?
    `).run(nome_loja, cnpj || null, telefone || null, email || null,
      endereco || null, logo_path || null, tema || 'light', moeda || 'BRL', metaDiaria, existe.id);
  } else {
    db.prepare(`
      INSERT INTO configuracao_loja (nome_loja, cnpj, telefone, email, endereco, logo_path, tema, moeda, meta_diaria)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(nome_loja, cnpj || null, telefone || null, email || null,
      endereco || null, logo_path || null, tema || 'light', moeda || 'BRL', metaDiaria);
  }

  const updated = db.prepare('SELECT * FROM configuracao_loja LIMIT 1').get();
  return res.json(updated);
});

module.exports = router;
