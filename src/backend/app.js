const express = require('express');
const cors = require('cors');
const db = require('../database/database');
const path = require('path');

const app = express();
const port = 8080;

// Middlewares
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// Rota para buscar dados da pokédex
app.get('/app', async (req, res) => {
  try {
    const [generationRows] = await db.query('SELECT id, name FROM generation ORDER BY id');
    const result = [];

    for (const generation of generationRows) {
      const [pokemons] = await db.query(
        `
        SELECT p.name, p.sprite_front
        FROM pokemon p
        JOIN generation_pokemon gp ON gp.pokemon_id = p.id
        WHERE gp.generation_id = ?
        ORDER BY p.id
      `,
        [generation.id]
      );

      result.push({
        generation: generation.name,
        pokemons
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar pokédex:', error);
    res.status(500).json({ error: 'Erro ao buscar pokédex' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
