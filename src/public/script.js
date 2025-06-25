document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('pokedex');

  try {
    const response = await fetch('/app');
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

        const img = document.createElement('img');
        img.src = pokemon.sprite_front;
        img.alt = pokemon.name;

        const name = document.createElement('p');
        name.textContent = pokemon.name;

        card.appendChild(img);
        card.appendChild(name);
        list.appendChild(card);
      });

      container.appendChild(list);
    });
  } catch (err) {
    console.error('Erro ao carregar pokémons:', err);
    container.innerHTML = '<p>Erro ao carregar dados 😢</p>';
  }
});
