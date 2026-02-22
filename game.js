// Basis data
const players = {
  Jens: {
    name: 'Jens',
    money: 50,
    cars: [],
    missions: [],
    score: 0
  },
  Broertje: {
    name: 'Broertje',
    money: 50,
    cars: [],
    missions: [],
    score: 0
  }
};

const shopUpgrades = [
  { name: 'Stage 1 Turbo', effect: '+1 snelheid', price: 4 },
  { name: 'Stage 2 Turbo', effect: '+2 snelheid', price: 7 },
  { name: 'Nitro Injectie', effect: '+3 boost', price: 10 },
  { name: 'Sportbanden', effect: '+1 grip', price: 3 },
  { name: 'Racebanden', effect: '+2 grip', price: 6 },
  { name: 'Aero-kit', effect: '+1 snelheid, +1 grip', price: 8 }
];

const shopGadgets = [
  { name: 'Mini-Turbo', effect: '1 extra boost', price: 2 },
  { name: 'Jump-Pad', effect: '1 extra sprong', price: 3 },
  { name: 'Magnet-Grip', effect: '+1 grip (1 race)', price: 2 },
  { name: 'Speed-Chip', effect: '+1 snelheid (1 race)', price: 2 }
];

const baseMissions = {
  Jens: [
    { title: 'Straatrace in de Buitenwijk', rewardMoney: 5 },
    { title: 'Drift-Challenge', rewardMoney: 0, rewardText: 'Grip-upgrade (Level 1)' },
    { title: 'Turbo Test Run', rewardMoney: 0, rewardText: 'Turbo-gadget' }
  ],
  Broertje: [
    { title: 'Rookie Race', rewardMoney: 3 },
    { title: 'Stunt Jump', rewardMoney: 0, rewardText: 'Aero-upgrade (Level 1)' },
    { title: 'Speed Trial', rewardMoney: 0, rewardText: 'Motor-upgrade (Level 1)' }
  ]
};

let currentPlayer = null;

// UI helpers
function playSound(id) {
  const el = document.getElementById(id);
  if (el) el.play();
}

function login(name) {
  currentPlayer = players[name];
  // init missions if empty
  if (currentPlayer.missions.length === 0) {
    currentPlayer.missions = baseMissions[name].map(m => ({ ...m, done: false }));
  }
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  updatePlayerInfo();
  renderGarage();
  renderShop();
  renderMissions();
  renderLeaderboard();
  playSound('snd-click');
}

function updatePlayerInfo() {
  document.getElementById('player-name').textContent = `Speler: ${currentPlayer.name}`;
  document.getElementById('player-money').textContent = `Geld: ${currentPlayer.money}`;
}

function showTab(tabName) {
  playSound('snd-click');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');

  // extra logica voor speciale tabs
  if (tabName === 'vehiclebay') renderVehicleBay();
}

// AUTO-UPLOAD → PROFIEL
function handleCarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const imgSrc = e.target.result;

    // Simpele auto-generatie (je kunt dit later uitbreiden)
    const car = generateCarProfile(imgSrc);
    currentPlayer.cars.push(car);
    currentPlayer.score += 5; // punten voor nieuwe auto
    renderGarage();
    renderLeaderboard();
    playSound('snd-upgrade');
  };
  reader.readAsDataURL(file);
}

function generateCarProfile(imgSrc) {
  // Random stats (1–10) en basisgegevens
  const rand = () => Math.floor(Math.random() * 10) + 1;
  const speed = rand();
  const power = rand();
  const grip = rand();
  const boost = rand();

  const zeroToHundred = (12 - speed).toFixed(1); // hoe hoger snelheid, hoe lager tijd
  const topSpeed = 150 + speed * 10;
  const weight = 900 + (11 - power) * 30;

  const value = speed + power + grip + boost; // simpel: som = geld
  const moneyValue = Math.max(5, Math.floor(value / 2)); // minimaal 5

  return {
    name: `Custom Car #${Date.now().toString().slice(-4)}`,
    img: imgSrc,
    zeroToHundred,
    topSpeed,
    weight,
    drive: 'RWD',
    engine: 'Turbo benzine',
    stats: { speed, power, grip, boost },
    gadgets: [],
    upgrades: [],
    value: moneyValue
  };
}

// GARAGE RENDER
function renderGarage() {
  const container = document.getElementById('garage-list');
  container.innerHTML = '';

  currentPlayer.cars.forEach(car => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="auto-profiel-title">🚗 AUTO PROFIEL: ${car.name}</div>
      <img src="${car.img}" alt="Auto">
      <div><span class="badge">Foto: geüpload</span></div>
      <hr>
      <strong>⚙️ TECHNISCHE GEGEVENS</strong><br>
      0–100 km/u: ${car.zeroToHundred} sec<br>
      Topsnelheid: ${car.topSpeed} km/u<br>
      Gewicht: ${car.weight} kg<br>
      Aandrijving: ${car.drive}<br>
      Motor-type: ${car.engine}<br>
      <hr>
      <strong>📊 STATS (1–10)</strong>
      <div class="stat-row"><span>Snelheid</span><span>${car.stats.speed}</span></div>
      <div class="stat-row"><span>Kracht</span><span>${car.stats.power}</span></div>
      <div class="stat-row"><span>Grip</span><span>${car.stats.grip}</span></div>
      <div class="stat-row"><span>Boost</span><span>${car.stats.boost}</span></div>
      <hr>
      <strong>🛠️ START-GADGETS</strong><br>
      <em>(koop gadgets in de shop)</em>
      <hr>
      <strong>🔼 UPGRADES</strong><br>
      <em>${car.upgrades.length === 0 ? 'Nog geen upgrades' : car.upgrades.join(', ')}</em>
      <hr>
      <strong>💰 TOTALE STARTWAARDE</strong><br>
      ${car.value} geld (1 geld = 10.000 geld)<br>
      <hr>
      <strong>📘 GARAGE-REGISTRATIE</strong><br>
      Speler: ${currentPlayer.name}
    `;
    container.appendChild(div);
  });

  updatePlayerInfo();
}

// SHOP RENDER + KOPEN
function renderShop() {
  const upgContainer = document.getElementById('shop-upgrades');
  const gadContainer = document.getElementById('shop-gadgets');
  upgContainer.innerHTML = '<h3>Upgrades</h3>';
  gadContainer.innerHTML = '<h3>Gadgets</h3>';

  shopUpgrades.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <strong>${item.name}</strong><br>
      Effect: ${item.effect}<br>
      Prijs: ${item.price} geld<br>
      <button class="btn" onclick="buyUpgrade(${index})">Koop</button>
    `;
    upgContainer.appendChild(div);
  });

  shopGadgets.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <strong>${item.name}</strong><br>
      Effect: ${item.effect}<br>
      Prijs: ${item.price} geld<br>
      <button class="btn" onclick="buyGadget(${index})">Koop</button>
    `;
    gadContainer.appendChild(div);
  });
}

function buyUpgrade(index) {
  const item = shopUpgrades[index];
  if (currentPlayer.money < item.price) {
    alert('Niet genoeg geld!');
    return;
  }
  if (currentPlayer.cars.length === 0) {
    alert('Je hebt nog geen auto om te upgraden!');
    return;
  }
  currentPlayer.money -= item.price;
  // voeg upgrade toe aan eerste auto (simpel)
  currentPlayer.cars[0].upgrades.push(item.name);
  currentPlayer.score += 3;
  renderGarage();
  renderLeaderboard();
  updatePlayerInfo();
  playSound('snd-upgrade');
}

function buyGadget(index) {
  const item = shopGadgets[index];
  if (currentPlayer.money < item.price) {
    alert('Niet genoeg geld!');
    return;
  }
  if (currentPlayer.cars.length === 0) {
    alert('Je hebt nog geen auto voor gadgets!');
    return;
  }
  currentPlayer.money -= item.price;
  currentPlayer.cars[0].gadgets.push(item.name);
  currentPlayer.score += 2;
  renderGarage();
  renderLeaderboard();
  updatePlayerInfo();
  playSound('snd-upgrade');
}

// MISSIES
function renderMissions() {
  const container = document.getElementById('mission-list');
  container.innerHTML = '';

  currentPlayer.missions.forEach((m, i) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <strong>${m.title}</strong><br>
      Beloning: ${m.rewardMoney ? m.rewardMoney + ' geld' : (m.rewardText || '—')}<br>
      Status: ${m.done ? '✅ Voltooid' : '⏳ Open'}<br>
      ${m.done ? '' : `<button class="btn" onclick="completeMission(${i})">Markeer als voltooid</button>`}
    `;
    container.appendChild(div);
  });
}

function completeMission(index) {
  const m = currentPlayer.missions[index];
  if (m.done) return;
  m.done = true;
  if (m.rewardMoney) currentPlayer.money += m.rewardMoney;
  currentPlayer.score += 10;
  renderMissions();
  renderLeaderboard();
  updatePlayerInfo();
  playSound('snd-race');
}

// LEADERBOARD
function renderLeaderboard() {
  const container = document.getElementById('leaderboard-list');
  container.innerHTML = '';

  const list = Object.values(players).sort((a, b) => b.score - a.score);
  list.forEach((p, idx) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <strong>#${idx + 1} ${p.name}</strong><br>
      Score: ${p.score}<br>
      Auto's: ${p.cars.length}<br>
      Geld: ${p.money}
    `;
    container.appendChild(div);
  });
}

// =========================
// ✈ VEHICLE BAY MODULE
// =========================

function renderVehicleBay() {
  const car = currentPlayer.cars[0];
  const box = document.getElementById('vehiclebay-screen');

  if (!car) {
    box.innerHTML = "<p>Je hebt nog geen auto om te docken!</p>";
    return;
  }

  box.innerHTML = `
    <div class="blueprint-box">
      <h3>🔍 Scan-systeem</h3>
      <button class="btn" onclick="scanCarInBay()">Scan Auto</button>
      <div id="bay-scan-output"></div>
    </div>

    <div class="blueprint-box">
      <h3>🚗 Vehicle Dock</h3>
      Auto: ${car.name}<br>
      Status: DOCKED<br>
      <button class="btn" onclick="startDropSequence()">Start Drop Sequence</button>
    </div>

    <div class="blueprint-box">
      <h3>🔥 Thruster Panel</h3>
      Thrusters: ONLINE<br>
      Fuel: 87%<br>
      Heat: 12%<br>
    </div>

    <div class="blueprint-box">
      <h3>📦 Cargo Lock System</h3>
      Lock Status: ENGAGED<br>
      Structural Integrity: 98%<br>
    </div>

    <div class="blueprint-box">
      <h3>🛠 Engine Control Module</h3>
      Engine Temp: 342°C<br>
      Power Output: ${car.stats.power * 12}%<br>
    </div>

    <div class="blueprint-box">
      <h3>🛬 Landing Gear Module</h3>
      Gear: RETRACTED<br>
      Shock Absorption: 76%<br>
    </div>
  `;
}

function scanCarInBay() {
  const out = document.getElementById('bay-scan-output');
  out.innerHTML = "Scanning...";
  setTimeout(() => {
    currentPlayer.score += 5;
    out.innerHTML = `
      <strong>SCAN COMPLETE</strong><br>
      Speed: ${currentPlayer.cars[0].stats.speed}<br>
      Grip: ${currentPlayer.cars[0].stats.grip}<br>
      Boost: ${currentPlayer.cars[0].stats.boost}<br>
      Power: ${currentPlayer.cars[0].stats.power}<br>
      <br>+5 punten verdiend!
    `;
    renderLeaderboard();
  }, 2000);
}

function startDropSequence() {
  const car = currentPlayer.cars[0];

  const successChance = car.stats.speed + car.stats.boost;
  const roll = Math.floor(Math.random() * 20) + 1;

  let result = "";

  if (roll < successChance / 2) {
    result = "❌ DROP FAILED – Auto crasht!";
    currentPlayer.score -= 5;
  } else if (roll < successChance) {
    result = "⚠️ DROP OK – Matige landing.";
    currentPlayer.score += 5;
  } else {
    result = "✅ PERFECT DROP – Stuntbonus!";
    currentPlayer.score += 15;
  }

  alert(result);
  renderLeaderboard();
}
function startThrusterBoostTest() {
  const car = currentPlayer.cars[0];
  if (!car) return;

  const base = car.stats.boost + car.stats.speed;
  const roll = Math.floor(Math.random() * 20) + 1;

  let text = "";
  let points = 0;

  if (roll + base < 20) {
    text = "🔥 Thruster Test: ONSTABIEL – je verliest wat controle.";
    points = 0;
  } else if (roll + base < 28) {
    text = "🔥 Thruster Test: OK – voldoende boost.";
    points = 5;
  } else {
    text = "🔥 Thruster Test: EPISCH – maximale boost, stuntbonus!";
    points = 12;
  }

  currentPlayer.score += points;
  alert(text + (points ? `\n+${points} punten` : ""));
  renderLeaderboard();
}
    <div class="blueprint-box">
      <h3>🚀 Thruster Boost Test</h3>
      <p>Test de boost-capaciteit van je auto.</p>
      <button class="btn" onclick="startThrusterBoostTest()">Start Boost Test</button>
    </div>
function startCargoLockHack() {
  const code = Math.floor(Math.random() * 3) + 1; // 1, 2 of 3
  const guess = prompt("Cargo Lock Hack\nKies een kanaal (1, 2 of 3):");

  if (!guess) return;

  if (parseInt(guess, 10) === code) {
    currentPlayer.score += 8;
    alert("🔓 Cargo Lock Override GELUKT!\n+8 punten");
  } else {
    currentPlayer.score -= 3;
    alert("⛔ FOUT kanaal – Lock blijft actief.\n-3 punten");
  }

  renderLeaderboard();
}
    <div class="blueprint-box">
      <h3>📦 Cargo Lock System</h3>
      Lock Status: ENGAGED<br>
      Structural Integrity: 98%<br>
      <button class="btn" onclick="startCargoLockHack()">Hack Cargo Lock</button>
    </div>
function startDropSequence() {
  const car = currentPlayer.cars[0];

  const successChance = car.stats.speed + car.stats.boost;
  const roll = Math.floor(Math.random() * 20) + 1;

  let result = "";
  let extra = "";

  if (roll < successChance / 2) {
    result = "❌ DROP FAILED – Auto crasht!";
    currentPlayer.score -= 5;
  } else if (roll < successChance) {
    result = "⚠️ DROP OK – Matige landing.";
    currentPlayer.score += 5;
  } else {
    result = "✅ PERFECT DROP – Stuntbonus!";
    currentPlayer.score += 15;
    extra = "\nPerfecte drop! +5 extra punten voor stijl.";
    currentPlayer.score += 5;
  }

  alert(result + extra);
  renderLeaderboard();
}
