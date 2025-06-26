document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('pokedex');

  try {
    const response = await fetch('/app?user_id=1');
    const data = await response.json();

    data.forEach(entry => {
      const title = document.createElement('h2');
      title.textContent = entry.generation;
      container.appendChild(title);

      const list = document.createElement('div');
      list.className = 'pokemon-list';

      entry.pokemons.forEach(pokemon => {

        const card = document.createElement('div');
        card.className = 'pokemon-card';

        const urlParams = new URLSearchParams(window.location.search);
        const userId = parseInt(urlParams.get('user_id')) || 1;

        // ⬇️ Armazena os dados necessários no elemento
        card.dataset.pokemonId = pokemon.id;
        card.dataset.userId = userId;

        const img = document.createElement('img');
        img.src = pokemon.sprite_front;
        img.alt = pokemon.name;

        const name = document.createElement('p');
        name.textContent = pokemon.name;

        card.appendChild(img);
        card.appendChild(name);
        list.appendChild(card);

        // status visual baseado no status salvo no banco
        if (pokemon.status === 'caught') {
          card.classList.add('caught');
        } 
        
        if (pokemon.status === 'catch_unavailable') {
          card.classList.add('unavailable');
        }

        // Clique esquerdo - marcar como 'caught'
        card.addEventListener('click', async () => {

          const userId = parseInt(card.dataset.userId);
          const pokemonId = parseInt(card.dataset.pokemonId);

          if (pokemon.status === 'caught') {
            await fetch('/api/pokemon/status', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: userId,
                pokemon_id: pokemonId
              })
            });

            card.classList.remove('caught');
            pokemon.status = null; // Atualiza localmente
            return;
          }

          await fetch('/api/pokemon/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              pokemon_id: pokemonId,
              status: 'caught'
            })
          });

          card.classList.remove('unavailable');
          card.classList.add('caught');
        });

        // Clique direito - marcar como 'catch_unavailable'
        card.addEventListener('contextmenu', async (event) => {

          const userId = parseInt(card.dataset.userId);
          const pokemonId = parseInt(card.dataset.pokemonId);

          if (pokemon.status === 'catch_unavailable') {
            await fetch('/api/pokemon/status', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: userId,
                pokemon_id: pokemonId
              })
            });

            card.classList.remove('caught');
            pokemon.status = null; // Atualiza localmente
            return;
          }

          event.preventDefault();

          await fetch('/api/pokemon/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              pokemon_id: pokemonId,
              status: 'catch_unavailable'
            })
          });

          card.classList.remove('caught');
          card.classList.add('unavailable');
        });
      });

      container.appendChild(list);
    });
  } catch (err) {
    console.error('Erro ao carregar pokémons:', err);
    container.innerHTML = '<p>Erro ao carregar dados 😢</p>';
  }
});
