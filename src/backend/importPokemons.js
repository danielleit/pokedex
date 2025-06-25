const axios = require('axios');
const mysql = require('mysql2/promise');

async function importPokemons() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'pokemon'
  });

  try {
    console.log('Etapa 1: Importando Pokédexes...');
    const pokedexRes = await axios.get('https://pokeapi.co/api/v2/pokedex?limit=100');
    const pokedexList = pokedexRes.data.results;

    for (const dex of pokedexList) {
      await pool.query(
        'INSERT IGNORE INTO pokedex (name) VALUES (?)',
        [dex.name]
      );
      console.log(`Pokédex importada: ${dex.name}`);
    }

    console.log('\nEtapa 2: Importando Pokémons...');
    const pokemonRes = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=100000');
    const pokemonList = pokemonRes.data.results;

    for (const poke of pokemonList) {
      try {
        const detalhe = await axios.get(poke.url);
        const name = detalhe.data.name;
        const sprites = detalhe.data.sprites;

        const spriteFront = sprites.front_default || null;

        await pool.query(
          `INSERT IGNORE INTO pokemon (name, sprite_front) VALUES (?, ?)`,
          [name, spriteFront]
        );

        console.log(`Pokémon importado: ${name}`);
      } catch (err) {
        console.warn(`Erro ao importar ${poke.name}:`, err.message);
      }
    }

    console.log('\nEtapa 3: Vinculando Pokémons às Pokédexes...');
    for (const dex of pokedexList) {
      try {
        const dexData = await axios.get(dex.url);
        const pokedexName = dexData.data.name;
        const pokemonEntries = dexData.data.pokemon_entries;

        const [pokedexRows] = await pool.query(
          'SELECT id FROM pokedex WHERE name = ?',
          [pokedexName]
        );
        if (pokedexRows.length === 0) continue;
        const pokedexId = pokedexRows[0].id;

        for (const entry of pokemonEntries) {
          const pokemonName = entry.pokemon_species.name;

          const [pokemonRows] = await pool.query(
            'SELECT id FROM pokemon WHERE name = ?',
            [pokemonName]
          );
          if (pokemonRows.length === 0) continue;
          const pokemonId = pokemonRows[0].id;

          await pool.query(
            'INSERT IGNORE INTO pokedex_pokemon (pokedex_id, pokemon_id) VALUES (?, ?)',
            [pokedexId, pokemonId]
          );
        }

        console.log(`Pokémons vinculados à Pokédex: ${pokedexName}`);
      } catch (err) {
        console.warn(`Erro ao vincular Pokédex ${dex.name}:`, err.message);
      }
    }

    console.log('\nImportação completa com sucesso!');
  } catch (err) {
    console.error('Erro geral durante a importação:', err);
  } finally {
    await pool.end();
  }
}

importPokemons();
