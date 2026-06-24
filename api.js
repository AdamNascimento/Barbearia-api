import express from 'express';
import db from './db.js';

const app = express();
const port = 3000;

app.use(express.json());

// Criar agendamento
app.post('/agendamentos', async (req, res) => {
    console.log('Body recebido:', req.body);
    const { nome, servico, data, hora, pagamento } = req.body;

    if (!nome || !servico || !data || !hora || !pagamento) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const [result] = await db.execute(
        'INSERT INTO agendamentos (nome, servico, data, hora, pagamento) VALUES (?, ?, ?, ?, ?)',
        [nome, servico, data, hora, pagamento]
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

