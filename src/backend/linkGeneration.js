const mysql = require('mysql2/promise');

async function insertGenerationPokemon() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'pokemon',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  const connection = await pool.getConnection();
  try {
    const ranges = [
      [1, 1, 151],
      [2, 152, 251],
      [3, 252, 386],
      [4, 387, 493],
      [5, 494, 649],
      [6, 650, 721],
      [7, 722, 809],
      [8, 810, 898],
      [9, 899, 905],
      [10, 906, 1025]
    ];

    for (const [generationId, start, end] of ranges) {
      const values = [];
      for (let pokemonId = start; pokemonId <= end; pokemonId++) {
        values.push([generationId, pokemonId]);
      }

      // Dividir em blocos de 1000 para evitar problemas com muitos valores
      const chunkSize = 1000;
      for (let i = 0; i < values.length; i += chunkSize) {
        const chunk = values.slice(i, i + chunkSize);
        await connection.query(
          'INSERT IGNORE INTO generation_pokemon (generation_id, pokemon_id) VALUES ?',
          [chunk]
        );
      }

      console.log(`✅ Inseridos pokémons da geração ${generationId}`);
    }
  } catch (err) {
    console.error('Erro ao inserir dados:', err);
  } finally {
    connection.release();
    await pool.end();
  }
}

insertGenerationPokemon();
