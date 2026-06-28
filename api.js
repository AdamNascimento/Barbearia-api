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

