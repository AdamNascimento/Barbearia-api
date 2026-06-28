import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());


// Criar agendamento
app.post('/agendamentos', async (req, res) => {
    const { nome, servico, data, hora, pagamento, barbeiro } = req.body;

    if (!nome || !servico || !data || !hora || !pagamento) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const [result] = await db.execute(
        'INSERT INTO agendamentos (nome, servico, data, hora, pagamento, barbeiro) VALUES (?, ?, ?, ?, ?, ?)',
        [nome, servico, data, hora, pagamento, barbeiro || null]
    );

    res.status(201).json({
        mensagem: 'Agendamento criado com sucesso',
        id: result.insertId
    });
});

// Listar agendamentos
app.get('/agendamentos', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM agendamentos ORDER BY data, hora');
    res.json(rows);
});

// Atualizar status
app.put('/agendamentos/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await db.execute(
        'UPDATE agendamentos SET status = ? WHERE id = ?',
        [status, id]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json({ mensagem: 'Agendamento atualizado com sucesso' });
});

// Deletar agendamento
app.delete('/agendamentos/:id', async (req, res) => {
    const { id } = req.params;

    const [result] = await db.execute(
        'DELETE FROM agendamentos WHERE id = ?',
        [id]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json({ mensagem: 'Agendamento excluído com sucesso' });
});

// ===== CONFIGURAÇÕES =====

// Serviços
app.get('/configuracoes/servicos', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM servicos WHERE ativo = 1 ORDER BY nome');
    res.json(rows);
});

app.post('/configuracoes/servicos', async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome obrigatório' });
    const [result] = await db.execute('INSERT INTO servicos (nome) VALUES (?)', [nome]);
    res.status(201).json({ id: result.insertId, nome });
});

app.delete('/configuracoes/servicos/:id', async (req, res) => {
    await db.execute('UPDATE servicos SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Serviço removido' });
});

// Formas de pagamento
app.get('/configuracoes/pagamentos', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM formas_pagamento WHERE ativo = 1 ORDER BY nome');
    res.json(rows);
});

app.post('/configuracoes/pagamentos', async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome obrigatório' });
    const [result] = await db.execute('INSERT INTO formas_pagamento (nome) VALUES (?)', [nome]);
    res.status(201).json({ id: result.insertId, nome });
});

app.delete('/configuracoes/pagamentos/:id', async (req, res) => {
    await db.execute('UPDATE formas_pagamento SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Forma de pagamento removida' });
});

// Barbeiros
app.get('/configuracoes/barbeiros', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM barbeiros WHERE ativo = 1 ORDER BY nome');
    res.json(rows);
});

app.post('/configuracoes/barbeiros', async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome obrigatório' });
    const [result] = await db.execute('INSERT INTO barbeiros (nome) VALUES (?)', [nome]);
    res.status(201).json({ id: result.insertId, nome });
});

app.delete('/configuracoes/barbeiros/:id', async (req, res) => {
    await db.execute('UPDATE barbeiros SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Barbeiro removido' });
});

// Horários
app.get('/configuracoes/horarios', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM horarios ORDER BY hora_inicio');
    res.json(rows);
});

app.put('/configuracoes/horarios', async (req, res) => {
    const { hora_inicio, hora_fim, intervalo_minutos } = req.body;
    await db.execute(
        'UPDATE horarios SET hora_inicio = ?, hora_fim = ?, intervalo_minutos = ? WHERE id = 1',
        [hora_inicio, hora_fim, intervalo_minutos]
    );
    res.json({ mensagem: 'Horários atualizados' });
});

app.listen(port, () => console.log(`Servidor na porta ${port}`));

// Listar assinantes
app.get('/assinantes', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM assinantes ORDER BY data_vencimento ASC');
    res.json(rows);
});

// Criar assinante
app.post('/assinantes', async (req, res) => {
    const { nome, telefone, plano, data_inicio, data_vencimento } = req.body;

    if (!nome || !plano || !data_inicio || !data_vencimento) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const [result] = await db.execute(
        'INSERT INTO assinantes (nome, telefone, plano, data_inicio, data_vencimento) VALUES (?, ?, ?, ?, ?)',
        [nome, telefone || null, plano, data_inicio, data_vencimento]
    );

    res.status(201).json({ mensagem: 'Assinante criado com sucesso', id: result.insertId });
});

// Atualizar assinante
app.put('/agendamentos/:id', async (req, res) => {
    const { id } = req.params;
    const { status, barbeiro } = req.body;

    const [result] = await db.execute(
        'UPDATE agendamentos SET status = ?, barbeiro = ? WHERE id = ?',
        [status, barbeiro || null, id]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json({ mensagem: 'Agendamento atualizado com sucesso' });
});

// Deletar assinante
app.delete('/assinantes/:id', async (req, res) => {
    const { id } = req.params;

    const [result] = await db.execute('DELETE FROM assinantes WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Assinante não encontrado' });
    }

    res.json({ mensagem: 'Assinante removido com sucesso' });
});

