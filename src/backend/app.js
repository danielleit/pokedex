const express = require('express');
const cors = require('cors');
const db = require('../database/database');
const path = require('path');

const app = express();
const port = 8080;

// Middlewares
app.use(cors());
app.use(express.json()); // para processar JSON no body
app.use(express.static(path.join(__dirname, '../public')));

// Rota para buscar dados da pokédex
app.get('/app', async (req, res) => {
  const userId = req.query.user_id || 1;
  try {
    const [generationRows] = await db.query('SELECT id, name, number FROM generation ORDER BY number, name, id;');
    const result = [];

    for (const generation of generationRows) {
      const [pokemons] = await db.query(
        `SELECT p.id, p.name, p.sprite_front, up.status
        FROM pokemon p
        JOIN generation_pokemon gp ON gp.pokemon_id = p.id
        LEFT JOIN user_pokemon up ON up.pokemon_id = p.id AND up.user_id = ?
        WHERE gp.generation_id = ?
        ORDER BY p.id;`,
      [userId, generation.id]
      );

      result.push({
        generation: generation.name,
        generation_number: generation.number,
        pokemons
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar pokédex:', error);
    res.status(500).json({ error: 'Erro ao buscar pokédex' });
  }
});

app.post('/api/pokemon/status', async (req, res) => {
  const { user_id, pokemon_id, status } = req.body;

  const allowedStatuses = ['caught', 'poke_unavailable', 'catch_unavailable'];
  if (!user_id || !pokemon_id || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  try {
    await db.query(
      `INSERT INTO user_pokemon (user_id, pokemon_id, status)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE status = ?;`,
      [user_id, pokemon_id, status, status]
    );

    res.status(200).json({ message: 'Status updated' });
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

app.delete('/api/pokemon/status', async (req, res) => {
  const { user_id, pokemon_id } = req.body;

  if (!user_id || !pokemon_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await db.query(
      'DELETE FROM user_pokemon WHERE user_id = ? AND pokemon_id = ?;',
      [user_id, pokemon_id]
    );

    res.status(200).json({ message: 'Status deleted' });
  } catch (err) {
    console.error('Erro ao deletar status:', err);
    res.status(500).json({ error: 'Erro ao deletar status' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
