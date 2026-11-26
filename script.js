
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = arr => arr[rand(0, arr.length - 1)];
const NS = 'http://www.w3.org/2000/svg';
const COLORS = { critico: 'var(--red)', aviso: 'var(--yellow)', bloqueado: 'var(--green)' };


const root = document.documentElement;
let fontPct = 100;
const setFont = v => { fontPct = Math.min(150, Math.max(80, v)); root.style.fontSize = fontPct + '%'; };
$('#btn-font-up').onclick = () => setFont(fontPct + 10);
$('#btn-font-down').onclick = () => setFont(fontPct - 10);
$('#btn-font-reset').onclick = () => setFont(100);
$('#btn-contrast').onclick = e => {
  const on = root.classList.toggle('inverted'); // aplica filter: invert(1)
  e.currentTarget.setAttribute('aria-pressed', on);
};


$('#login-form').onsubmit = e => {
  e.preventDefault();
  if (!$('#user').value.trim() || !$('#pass').value.trim()) {
    $('#login-msg').textContent = 'Preencha usuário e senha.';
    return;
  }
  $('#login-screen').hidden = true;
  $('#app').hidden = false;
  startMonitoring();
  buildMap();
  buildCams();
};
$('#btn-logout').onclick = () => location.reload();


$$('.tab').forEach(tab => tab.onclick = () => {
  $$('.tab').forEach(t => { t.classList.toggle('active', t === tab); t.setAttribute('aria-selected', t === tab); });
  $$('.panel').forEach(p => p.hidden = p.id !== 'tab-' + tab.dataset.tab);
  if (tab.dataset.tab !== 'game') endGame(true); // pausa o jogo ao sair da aba
});


const COUNTRIES = ['Rússia', 'China', 'Nigéria', 'EUA', 'Irã', 'Alemanha', 'Coreia do Sul', 'Austrália'];
const ATTACKS = ['Brute Force', 'SQL Injection', 'DDoS', 'XSS', 'Phishing', 'Port Scan'];
const STATUS = { critico: 'Crítico', aviso: 'Aviso', bloqueado: 'Bloqueado' };
let blocked = 12840, active = 3;

function addLog() {
  const status = pick(['bloqueado', 'bloqueado', 'bloqueado', 'aviso', 'critico']);
  const now = new Date().toLocaleTimeString('pt-BR');
  const ip = [rand(11, 223), rand(0, 255), rand(0, 255), rand(1, 254)].join('.');
  const tr = document.createElement('tr');
  tr.className = 'new-row';
  tr.innerHTML = `<td>${ip}</td><td>${pick(COUNTRIES)}</td><td>${pick(ATTACKS)}</td><td>${now}</td>
    <td><span class="badge ${status}">${STATUS[status]}</span></td>`;
  const body = $('#log-body');
  body.prepend(tr);
  if (body.children.length > 12) body.lastChild.remove();
  if (status === 'bloqueado') blocked += rand(1, 6); else active = Math.max(1, active + (Math.random() > .5 ? 1 : -1));
  $('#stat-blocked').textContent = blocked.toLocaleString('pt-BR');
  $('#stat-active').textContent = active;
}
function startMonitoring() {
  for (let i = 0; i < 8; i++) addLog();
  setInterval(addLog, 2500);
}


const proj = ([lon, lat]) => [(lon + 180) / 360 * 1000, (90 - lat) / 180 * 500];
const CONTINENTS = [
  [[-168,66],[-140,70],[-95,72],[-60,60],[-55,48],[-80,25],[-97,18],[-85,10],[-105,22],[-125,40]], // América do Norte
  [[-80,10],[-60,10],[-35,-6],[-40,-23],[-58,-38],[-68,-55],[-75,-45],[-72,-18],[-80,-3]],       // América do Sul
  [[-10,36],[-10,58],[10,70],[40,68],[60,55],[40,40],[28,36],[10,38]],                           // Europa
  [[-17,21],[-6,36],[32,31],[43,12],[51,11],[40,-15],[32,-30],[20,-35],[12,-18],[8,4],[-17,14]], // África
  [[60,55],[100,78],[170,68],[140,45],[122,30],[108,10],[100,3],[80,8],[68,24],[50,30],[40,40]], // Ásia
  [[114,-22],[130,-12],[142,-11],[153,-27],[146,-39],[115,-34]]                                  // Oceania
];
const SOURCES = [[37,55],[116,40],[3,6],[-74,40],[51,35],[151,-33],[8,50],[127,37]];
const TARGET = [-47.9, -15.8]; // Datacenter (Brasília)

function el(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  parent.appendChild(n);
  return n;
}
function buildMap() {
  const svg = $('#world-map');
  for (let x = 0; x <= 1000; x += 100) el('line', { x1: x, y1: 0, x2: x, y2: 500, class: 'grid-line' }, svg);
  for (let y = 0; y <= 500; y += 100) el('line', { x1: 0, y1: y, x2: 1000, y2: y, class: 'grid-line' }, svg);
  CONTINENTS.forEach(c => el('polygon', { points: c.map(p => proj(p).join(',')).join(' '), class: 'continent' }, svg));
  const [tx, ty] = proj(TARGET);
  el('circle', { cx: tx, cy: ty, r: 7, fill: 'var(--green)', class: 'pulse' }, svg);
  SOURCES.forEach(s => { const [x, y] = proj(s); el('circle', { cx: x, cy: y, r: 3, fill: 'var(--cyan)' }, svg); });

  
  const fire = () => {
    const [sx, sy] = proj(pick(SOURCES));
    const color = pick([COLORS.critico, COLORS.aviso, COLORS.bloqueado]);
    const arc = el('path', { d: `M${sx},${sy} Q${(sx + tx) / 2},${Math.min(sy, ty) - 90} ${tx},${ty}`, stroke: color, class: 'arc' }, svg);
    const src = el('circle', { cx: sx, cy: sy, r: 6, fill: color, class: 'pulse' }, svg);
    setTimeout(() => { arc.remove(); src.remove(); }, 2600);
  };
  fire(); setInterval(fire, 900);
}


const CAMS = [
  { code: 'CAM 01 - Sala de Servidores', scene: 'racks',   img: 'img/cam1.jpg' },
  { code: 'CAM 02 - Entrada Principal',  scene: 'door',    img: 'img/cam2.jpg' },
  { code: 'CAM 03 - Corredor Norte',     scene: 'hall',    img: 'img/cam3.jpg' },
  { code: 'CAM 04 - Perímetro Externo',  scene: 'fence',   img: 'img/cam4.jpg' },
  { code: 'CAM 05 - Estacionamento',     scene: 'parking', img: 'img/cam5.jpg' },
  { code: 'CAM 06 - Sala de Controle',   scene: 'control', img: 'img/cam6.jpg' }
];


const person = (x, y, s = 1, c = '#05080f') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-34" r="6" fill="${c}"/>
   <path d="M-8 -26h16l3 22h-5l-2 22h-4l-1-16-1 16h-4l-2-22h-5z" fill="${c}"/></g>`;
const motion = (x, y, w, h) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#EF4444" stroke-dasharray="4 2"/>
   <text x="${x}" y="${y - 3}" font-size="7" fill="#EF4444" font-family="monospace">MOVIMENTO</text>`;

function sceneSvg(type) {
  const defs = `<defs>
    <linearGradient id="g-${type}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f2038"/><stop offset="1" stop-color="#070d18"/></linearGradient>
    <radialGradient id="l-${type}"><stop offset="0" stop-color="#fde68a" stop-opacity=".55"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient></defs>`;
  let s = `<rect width="320" height="180" fill="url(#g-${type})"/>`;

  if (type === 'racks') {
    s += '<rect y="140" width="320" height="40" fill="#0a111d"/>';
    for (let i = 0; i < 6; i++) {
      s += `<rect x="${10 + i * 52}" y="20" width="44" height="130" rx="2" fill="#1b2a41" stroke="#22D3EE" stroke-opacity=".5"/>`;
      for (let j = 0; j < 9; j++) s += `<rect x="${14 + i * 52}" y="${28 + j * 13}" width="36" height="9" fill="#101b2e"/>
        <circle cx="${46 + i * 52}" cy="${32.5 + j * 13}" r="1.8" fill="${(i * j) % 7 ? '#22C55E' : '#F59E0B'}"/>`;
    }
    s += '<path d="M0 12h320" stroke="#22D3EE" stroke-opacity=".4"/>' + person(165, 172, 1.1) + motion(148, 118, 36, 58);
  }
  if (type === 'door') {
    s += '<rect y="140" width="320" height="40" fill="#0a111d"/><rect x="70" y="30" width="180" height="110" fill="#16263b" stroke="#22D3EE" stroke-opacity=".6"/>'
      + '<rect x="78" y="38" width="80" height="102" fill="#22D3EE" fill-opacity=".12"/><rect x="162" y="38" width="80" height="102" fill="#22D3EE" fill-opacity=".12"/>'
      + '<rect x="100" y="14" width="120" height="12" fill="#2563EB"/><text x="160" y="23" font-size="8" fill="#F8FAFC" text-anchor="middle" font-family="monospace">ENTRADA PRINCIPAL</text>'
      + '<rect x="256" y="80" width="10" height="16" fill="#111827" stroke="#22D3EE"/><circle cx="261" cy="88" r="2" fill="#22C55E"/>'
      + person(200, 150, 1.2) + motion(184, 112, 36, 58);
  }
  if (type === 'hall') {
    s += '<polygon points="0,0 125,62 195,62 320,0" fill="#14233a"/><polygon points="0,180 125,118 195,118 320,180" fill="#0a111d"/>'
      + '<polygon points="0,0 125,62 125,118 0,180" fill="#101c30"/><polygon points="320,0 195,62 195,118 320,180" fill="#101c30"/>'
      + '<rect x="125" y="62" width="70" height="56" fill="#22D3EE" fill-opacity=".15" stroke="#22D3EE"/>';
    [[40, 56], [78, 70], [105, 82]].forEach(([x, y]) => s += `<rect x="${x}" y="${y}" width="14" height="${y + 18}" fill="#1d3150" stroke="#22D3EE" stroke-opacity=".4"/>`);
    s += '<ellipse cx="160" cy="10" rx="40" ry="8" fill="url(#l-hall)"/><ellipse cx="160" cy="40" rx="25" ry="5" fill="url(#l-hall)"/>' + person(160, 118, .7);
  }
  if (type === 'fence') {
    s = `<rect width="320" height="180" fill="#050a14"/><circle cx="260" cy="30" r="12" fill="#e2e8f0" fill-opacity=".8"/>`
      + '<rect y="130" width="320" height="50" fill="#0b1622"/>';
    for (let i = 0; i < 29; i++) s += `<line x1="${i * 11}" y1="70" x2="${i * 11}" y2="135" stroke="#22D3EE" stroke-opacity=".45"/>`;
    s += '<line x1="0" y1="85" x2="320" y2="85" stroke="#22D3EE" stroke-opacity=".5"/><line x1="0" y1="120" x2="320" y2="120" stroke="#22D3EE" stroke-opacity=".5"/>'
      + '<rect x="30" y="30" width="6" height="105" fill="#1b2a41"/><polygon points="33,36 0,135 90,135" fill="url(#l-fence)"/>'
      + '<polygon points="33,36 0,135 90,135" fill="#fde68a" fill-opacity=".08"/>' + person(210, 168, 1, '#02050a') + motion(194, 126, 34, 48);
  }
  if (type === 'parking') {
    s += '<rect y="70" width="320" height="110" fill="#0b1520"/>';
    for (let i = 0; i < 5; i++) s += `<line x1="${20 + i * 65}" y1="90" x2="${5 + i * 70}" y2="180" stroke="#F8FAFC" stroke-opacity=".35"/>`;
    [[28, 95, '#2563EB'], [160, 100, '#64748B'], [235, 95, '#EF4444']].forEach(([x, y, c]) =>
      s += `<rect x="${x}" y="${y}" width="50" height="26" rx="6" fill="${c}" fill-opacity=".75"/><rect x="${x + 8}" y="${y - 8}" width="34" height="12" rx="4" fill="#0d1a2b"/>
      <circle cx="${x + 10}" cy="${y + 26}" r="5" fill="#05080f"/><circle cx="${x + 40}" cy="${y + 26}" r="5" fill="#05080f"/>`);
    [[60], [260]].forEach(([x]) => s += `<rect x="${x}" y="20" width="3" height="80" fill="#334155"/><ellipse cx="${x + 1}" cy="26" rx="35" ry="30" fill="url(#l-parking)"/>`);
    s += motion(150, 85, 66, 46);
  }
  if (type === 'control') {
    s += '<rect y="140" width="320" height="40" fill="#0a111d"/>';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++)
      s += `<rect x="${20 + i * 72}" y="${14 + j * 50}" width="64" height="42" fill="#07111f" stroke="#22D3EE" stroke-opacity=".6"/>
        <polyline points="${24 + i * 72},${48 + j * 50} ${40 + i * 72},${30 + j * 50} ${56 + i * 72},${44 + j * 50} ${72 + i * 72},${22 + j * 50}" fill="none" stroke="${(i + j) % 3 ? '#22C55E' : '#EF4444'}" stroke-width="1.5"/>`;
    s += '<rect x="60" y="125" width="200" height="14" rx="3" fill="#1b2a41"/>' + person(160, 128, 1.2);
  }
  return `<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">${defs}${s}</svg>`;
}

function buildCams() {
  const grid = $('#cam-grid');
  CAMS.forEach(c => {
    const d = document.createElement('div');
    d.className = 'cam';
    d.innerHTML = sceneSvg(c.scene) +
      `<img src="${c.img}" alt="${c.code}" loading="lazy" onerror="this.remove()">
       <span class="cam-ui cam-code">${c.code}</span>
       <span class="cam-ui cam-status">● ONLINE · REC</span>
       <span class="cam-ui cam-time"></span>`;
    grid.appendChild(d);
  });
  const tick = () => $$('.cam-time').forEach(t => t.textContent = new Date().toLocaleString('pt-BR'));
  tick(); setInterval(tick, 1000);
}


let score = 0, best = 0, integrity = 100, spawnTimer = null, running = false;
const area = $('#game-area');

function renderIntegrity() {
  $('#g-bar').style.width = integrity + '%';
  $('#g-bar').style.background = integrity > 60 ? 'var(--green)' : integrity > 30 ? 'var(--yellow)' : 'var(--red)';
  $('#g-integrity').textContent = integrity + '%';
}
function spawnPacket() {
  if (!running) return;
  const p = document.createElement('button');
  p.className = 'packet';
  p.textContent = '☠';
  p.setAttribute('aria-label', 'Pacote malicioso');
  p.style.left = rand(0, area.clientWidth - 48) + 'px';
  p.style.top = rand(0, area.clientHeight - 48) + 'px';
  // Clique = ataque bloqueado
  p.onclick = () => { score += 10; $('#g-score').textContent = score; clearTimeout(p.t); p.remove(); };
  // Tempo esgotado = dano na integridade (reduz com a pontuação)
  p.t = setTimeout(() => {
    if (!p.isConnected) return;
    p.remove();
    integrity = Math.max(0, integrity - 10);
    renderIntegrity();
    if (integrity === 0) endGame(false);
  }, Math.max(600, 1400 - score * 3));
  area.appendChild(p);
  spawnTimer = setTimeout(spawnPacket, Math.max(350, 900 - score * 2)); // dificuldade progressiva
}
function startGame() {
  endGame(true);
  score = 0; integrity = 100; running = true;
  $('#g-score').textContent = 0;
  renderIntegrity();
  $('#g-msg').hidden = true;
  $('#g-start').textContent = 'Reiniciar';
  spawnPacket();
}
function endGame(silent) {
  running = false;
  clearTimeout(spawnTimer);
  $$('.packet', area).forEach(p => { clearTimeout(p.t); p.remove(); });
  if (silent) return;
  best = Math.max(best, score);
  $('#g-best').textContent = best;
  $('#g-msg').hidden = false;
  $('#g-msg').textContent = `Sistema comprometido! Pontos de defesa: ${score}. Clique em Reiniciar.`;
}
$('#g-start').onclick = startGame;