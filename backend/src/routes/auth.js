const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function toPerfil(role) {
  return role === 'ADMIN' ? 'ADMIN' : 'VENDEDOR';
}

function loginFromEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const at = email.indexOf('@');
  return at > 0 ? email.slice(0, at) : email;
}

function buildTokenPayload(usuario) {
  const perfil = toPerfil(usuario.role);
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    login: loginFromEmail(usuario.email),
    perfil
  };
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { login, email, senha } = req.body;
  const loginValue = String(login || email || '').trim();

  if (!loginValue || !senha) {
    return res.status(400).json({ error: 'Login e senha são obrigatórios.' });
  }

  const db = getDb();
  const usuario = db.prepare(`
    SELECT *
    FROM usuarios
    WHERE ativo = 1
      AND (
        lower(email) = lower(?)
        OR lower(substr(email, 1, instr(email, '@') - 1)) = lower(?)
      )
    LIMIT 1
  `).get(loginValue, loginValue);
  if (!usuario) {
    return res.status(401).json({ error: 'Login ou senha inválidos.' });
  }

  const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
  if (!senhaValida) {
    return res.status(401).json({ error: 'Login ou senha inválidos.' });
  }

  const payload = buildTokenPayload(usuario);
  const perfil = payload.perfil;
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return res.json({
    token,
    usuario: {
      id: usuario.id,
      login: loginFromEmail(usuario.email),
      nome: usuario.nome,
      perfil
    }
  });
});

// POST /api/auth/registrar
router.post('/registrar', (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  const db = getDb();
  const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (existe) {
    return res.status(409).json({ error: 'Email já cadastrado.' });
  }

  const senhaHash = bcrypt.hashSync(senha, 10);
  const result = db.prepare(`
    INSERT INTO usuarios (nome, email, senha_hash, role)
    VALUES (?, ?, ?, 'OPERADOR')
  `).run(nome, email, senhaHash);

  return res.status(201).json({ id: result.lastInsertRowid, nome, email, role: 'OPERADOR' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const db = getDb();
  const usuario = db.prepare(`
    SELECT id, nome, email, role
    FROM usuarios
    WHERE id = ? AND ativo = 1
    LIMIT 1
  `).get(req.usuario.id);

  if (!usuario) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  const payload = buildTokenPayload(usuario);
  return res.json({
    usuario: {
      id: payload.id,
      nome: payload.nome,
      email: payload.email,
      login: payload.login,
      perfil: payload.perfil
    }
  });
});

// PUT /api/auth/conta
router.put('/conta', authMiddleware, (req, res) => {
  const nome = String(req.body.nome || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
  }

  const db = getDb();
  const existente = db.prepare('SELECT id FROM usuarios WHERE lower(email) = lower(?) AND id <> ?').get(email, req.usuario.id);
  if (existente) {
    return res.status(409).json({ error: 'Email já cadastrado por outro usuário.' });
  }

  const updateResult = db.prepare(`
    UPDATE usuarios
    SET nome = ?, email = ?
    WHERE id = ? AND ativo = 1
  `).run(nome, email, req.usuario.id);

  if (updateResult.changes === 0) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  const usuarioAtualizado = db.prepare(`
    SELECT id, nome, email, role
    FROM usuarios
    WHERE id = ?
    LIMIT 1
  `).get(req.usuario.id);

  const payload = buildTokenPayload(usuarioAtualizado);
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return res.json({
    token,
    usuario: {
      id: payload.id,
      nome: payload.nome,
      email: payload.email,
      login: payload.login,
      perfil: payload.perfil
    }
  });
});

// PUT /api/auth/senha
router.put('/senha', authMiddleware, (req, res) => {
  const senhaAtual = String(req.body.senha_atual || '');
  const novaSenha = String(req.body.nova_senha || '');

  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ error: 'senha_atual e nova_senha são obrigatórias.' });
  }

  if (novaSenha.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
  }

  const db = getDb();
  const usuario = db.prepare('SELECT id, senha_hash FROM usuarios WHERE id = ? AND ativo = 1 LIMIT 1').get(req.usuario.id);
  if (!usuario) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  const senhaValida = bcrypt.compareSync(senhaAtual, usuario.senha_hash);
  if (!senhaValida) {
    return res.status(400).json({ error: 'Senha atual inválida.' });
  }

  const novaSenhaHash = bcrypt.hashSync(novaSenha, 10);
  db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?').run(novaSenhaHash, req.usuario.id);

  return res.json({ ok: true });
});

module.exports = router;
