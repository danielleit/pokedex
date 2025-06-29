document.addEventListener('DOMContentLoaded', async () => {

  const container = document.getElementById('pokedex');

  // Fecha selects abertos clicando fora
  document.addEventListener('click', (e) => {
    if (!e.target.closest('select')) {
      document.querySelectorAll('.pokemon-card select').forEach(s => s.remove());
    }
  });

  try {
    const response = await fetch('/app?user_id=1');
    const data = await response.json();
    let totalCaught = 0;
    let totalSemStatus = 0;
    let totalCaughtRegions = 0;
    let totalSemStatusRegions = 0;

    data.forEach(entry => {  
      const genNumber = entry.generation_number;
      const genName = entry.generation;
      const total = entry.pokemons.length;

      const caught = entry.pokemons.filter(p => p.status === 'caught').length;

      // Considera "sem status" como pokémons que não estão marcados com 'poke_unavailable' ou 'catch_unavailable'
      const semStatus = entry.pokemons.filter(p =>
        !p.status || (p.status !== 'poke_unavailable' && p.status !== 'catch_unavailable')
      ).length;

      // Ignora gerações que são formas especiais no total das regiões
      const isRegionalForm = /Form$/i.test(genName); // ex: "Alolan Form", "Galarian Form", etc.
      if (!isRegionalForm) {
        totalCaught += caught;
        totalSemStatus += semStatus;
      }

      if(isRegionalForm){
        totalCaughtRegions += caught;
        totalSemStatusRegions += semStatus;
      }

      const title = document.createElement('h2');
      title.className = 'generation-title';
      title.textContent = `${genName} (${genNumber}ª Geração)`;

      const titleContainer = document.createElement('div');
      titleContainer.className = 'generation-header';

      const statusBox = document.createElement('div');
      statusBox.className = 'status-box';
      statusBox.textContent = `${caught}/${semStatus}`;

      titleContainer.appendChild(title);
      titleContainer.appendChild(statusBox);
      container.appendChild(titleContainer);

      const list = document.createElement('div');
      list.className = 'pokemon-list';

      entry.pokemons.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';

        const urlParams = new URLSearchParams(window.location.search);
        const userId = parseInt(urlParams.get('user_id')) || 1;

        card.dataset.pokemonId = pokemon.id;
        card.dataset.userId = userId;
        card.dataset.status = pokemon.status || '';

        const img = document.createElement('img');
        img.src = pokemon.sprite_front;
        img.alt = pokemon.name;

        const name = document.createElement('p');
        name.textContent = pokemon.name;

        card.appendChild(img);
        card.appendChild(name);
        list.appendChild(card);

        aplicarClasseStatus(card, pokemon.status);

        // Clique esquerdo = toggle 'caught'
        card.addEventListener('click', async () => {
          const current = card.dataset.status;
          if (current === 'caught') {
            await atualizarStatus(card, null);
          } else {
            await atualizarStatus(card, 'caught');
          }
        });

        // Clique direito = menu de contexto (select)
        card.addEventListener('contextmenu', async (event) => {
          event.preventDefault();

          if (card.querySelector('select')) return;

          const select = document.createElement('select');
          const options = [
            { value: '', label: 'Remover status' },
            { value: 'poke_unavailable', label: 'Pokémon Indisponível' },
            { value: 'catch_unavailable', label: 'Catch Indisponível' }
          ];

          options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            select.appendChild(option);
          });

          select.value = card.dataset.status || '';

          select.addEventListener('click', (e) => {
            e.stopPropagation();
          });

          select.addEventListener('change', async () => {
            console.log('Novo status selecionado:', select.value); // teste
            const newStatus = select.value || null;
            await atualizarStatus(card, newStatus);
            select.remove();
          });

          card.style.position = 'relative';
          select.style.top = `${event.offsetY}px`;
          select.style.left = `${event.offsetX}px`;
          card.appendChild(select);
        });
      });
      container.appendChild(list);
    });

    const subtitleContainer = document.querySelector('.pokedex-subtitle');

    // Bolha da Pokédex (sem formas regionais)
    const pokedexBox = document.createElement('div');
    pokedexBox.className = 'status-box-subtitle pokedex';
    pokedexBox.textContent = `Pokédex: ${totalCaught}/${totalSemStatus}`;

    // Bolha com formas regionais
    const regionsBox = document.createElement('div');
    regionsBox.className = 'status-box-subtitle regions';
    regionsBox.textContent = `Regions: ${totalCaughtRegions}/${totalSemStatusRegions}`;

    subtitleContainer.appendChild(pokedexBox);
    subtitleContainer.appendChild(regionsBox);

  } catch (err) {
    console.error('Erro ao carregar pokémons:', err);
    container.innerHTML = '<p>Erro ao carregar dados</p>';
  }

  // Função de status genérica
  async function atualizarStatus(card, newStatus) {
    const userId = parseInt(card.dataset.userId);
    const pokemonId = parseInt(card.dataset.pokemonId);

    try {
      if (newStatus === null) {
        await fetch('/api/pokemon/status', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, pokemon_id: pokemonId })
        });
      } else {
        await fetch('/api/pokemon/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, pokemon_id: pokemonId, status: newStatus })
        });
      }

      aplicarClasseStatus(card, newStatus);
      card.dataset.status = newStatus || '';
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  }

  function aplicarClasseStatus(card, status) {
    const classMap = {
      'caught': 'caught',
      'poke_unavailable': 'poke-unavailable',
      'catch_unavailable': 'catch-unavailable'
    };

    card.className = 'pokemon-card'; // Reseta todas as classes
    if (status && classMap[status]) {
      card.classList.add(classMap[status]);
    }
  }

});
