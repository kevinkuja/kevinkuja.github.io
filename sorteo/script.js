let players = [];
let currentCourt = 23;

document.getElementById('playerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    addPlayer(
        document.getElementById('name').value,
        document.getElementById('preferredTime').value,
        document.getElementById('playSingles').checked
    );
    this.reset();
});

document.getElementById('bulkPlayerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const bulkText = document.getElementById('bulkPlayers').value;
    const lines = bulkText.split('\n');
    lines.forEach(line => {
        const cleanedLine = line.replace(/^\d+\.?\s*/, '').trim();
        if (cleanedLine) {
            const parts = cleanedLine.split(/\s+/);
            let name = parts[0];
            let preferredTime = '';
            let playSingles = false;

            if (parts.length > 1 && !parts[1].match(/^\d/)) {
                name += ' ' + parts[1];
                parts.splice(1, 1);
            }

            if (parts[parts.length - 1].toLowerCase() === 'single') {
                playSingles = true;
                parts.pop();
            }

            if (parts.length > 1) {
                preferredTime = parts[parts.length - 1];
            }

            addPlayer(name, preferredTime, playSingles);
        }
    });
    this.reset();
    updatePlayerList();
});

function addPlayer(name, preferredTime, playSingles) {
    players.push({ name, preferredTime, playSingles });
    updatePlayerList();
}

function updatePlayerList() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';
    players.forEach((player, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${player.name} - Horario: ${player.preferredTime || 'No especificado'} - ${player.playSingles ? 'Juega singles' : 'No juega singles'}`;
        playerList.appendChild(li);
    });
}

document.getElementById('toggleInput').addEventListener('click', function() {
    const playerForm = document.getElementById('playerForm');
    const bulkPlayerForm = document.getElementById('bulkPlayerForm');
    if (playerForm.style.display === 'none') {
        playerForm.style.display = 'block';
        bulkPlayerForm.style.display = 'none';
        this.textContent = 'Cambiar a entrada masiva';
    } else {
        playerForm.style.display = 'none';
        bulkPlayerForm.style.display = 'block';
        this.textContent = 'Cambiar a entrada individual';
    }
});

document.getElementById('organizeMatches').addEventListener('click', organizeMatches);

function organizeMatches() {
    const shuffledPlayers = shuffle([...players]);
    const singles = shuffledPlayers.filter(player => player.playSingles);
    const doubles = shuffledPlayers.filter(player => !player.playSingles);

    const matchesDiv = document.getElementById('matches');
    matchesDiv.innerHTML = '';
    currentCourt = 23;

    // Organizar partidos de dobles
    while (doubles.length >= 4) {
        const match = doubles.splice(0, 4);
        addMatch(matchesDiv, match, 'Dobles');
    }

    // Organizar partidos de singles
    while (singles.length >= 2) {
        const match = singles.splice(0, 2);
        addMatch(matchesDiv, match, 'Singles');
    }

    // Si quedan jugadores, formar un partido mixto o adicional de singles
    const remainingPlayers = [...doubles, ...singles];
    if (remainingPlayers.length === 4) {
        addMatch(matchesDiv, remainingPlayers, 'Dobles');
    } else if (remainingPlayers.length === 2) {
        addMatch(matchesDiv, remainingPlayers, 'Singles');
    } else if (remainingPlayers.length > 0) {
        const p = document.createElement('p');
        p.textContent = `Jugadores sin partido: ${remainingPlayers.map(p => p.name).join(', ')}`;
        matchesDiv.appendChild(p);
    }
}

function addMatch(container, players, type) {
    const div = document.createElement('div');
    const court = assignCourt(players);
    div.innerHTML = `<h3>Partido de ${type} - Cancha ${court}</h3>
                     <p>${players.map(p => p.name).join(' vs ')}</p>
                     <p>Horario sugerido: ${suggestTime(players)}</p>`;
    container.appendChild(div);
}

function assignCourt(players) {
    if (players.some(p => p.name.toLowerCase().startsWith('dan'))) {
        return 23;
    } else {
        const court = currentCourt;
        currentCourt = currentCourt > 1 ? currentCourt - 1 : 1;
        return court;
    }
}

function suggestTime(players) {
    const times = players.map(p => p.preferredTime).filter(Boolean);
    return times.length > 0 ? times[Math.floor(Math.random() * times.length)] : 'No especificado';
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}