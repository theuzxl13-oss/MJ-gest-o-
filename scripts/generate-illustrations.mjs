/**
 * Gera as ilustrações institucionais (SVG) usadas como imagens padrão.
 * Podem ser substituídas por fotografias profissionais no painel /admin.
 * Uso: node scripts/generate-illustrations.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const C = { forest: '#103B2B', green: '#285943', light: '#3A7459', gold: '#B69A5B', goldL: '#D4BF8E', off: '#F7F6F2', white: '#FFFFFF' };

// Gerador pseudoaleatório determinístico
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function hill(w, h, base, amp, seed, freq = 3) {
  const r = rng(seed);
  const pts = [];
  const phase = r() * 6;
  for (let x = 0; x <= w; x += w / 40) {
    const y = base - Math.sin((x / w) * Math.PI * freq + phase) * amp - Math.sin((x / w) * Math.PI * freq * 2.3 + phase) * amp * 0.35;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M0,${h} L${pts.join(' L')} L${w},${h} Z`;
}

function tree(x, y, s, color, kind = 0) {
  if (kind === 0) {
    return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-1.5" y="-6" width="3" height="10" fill="${C.forest}"/><path d="M0,-46 L14,-14 L8,-14 L18,4 L-18,4 L-8,-14 L-14,-14 Z" fill="${color}"/></g>`;
  }
  return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-1.5" y="-8" width="3" height="12" fill="${C.forest}"/><circle cx="0" cy="-22" r="16" fill="${color}"/><circle cx="-9" cy="-14" r="10" fill="${color}"/><circle cx="10" cy="-13" r="11" fill="${color}"/></g>`;
}

function forest(w, baseY, count, seed, colors, scale = 1) {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = r() * w;
    const s = (0.7 + r() * 0.8) * scale;
    out += tree(x.toFixed(1), (baseY + r() * 18).toFixed(1), s.toFixed(2), colors[Math.floor(r() * colors.length)], r() > 0.55 ? 1 : 0);
  }
  return out;
}

function contours(w, h, cx, cy, n, color, opacity = 0.25) {
  let out = '';
  for (let i = 1; i <= n; i++) {
    const rx = i * (w / (n * 1.6));
    const ry = rx * 0.55;
    out += `<ellipse cx="${cx}" cy="${cy}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.2" transform="rotate(-12 ${cx} ${cy})"/>`;
  }
  return out;
}

function building(x, y, w, h, color, windowColor) {
  let out = `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${color}"/>`;
  const cols = Math.max(2, Math.floor(w / 16));
  const rows = Math.floor(h / 22);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = x + 8 + c * ((w - 16) / cols);
      const wy = y - h + 12 + r * 22;
      out += `<rect x="${wx.toFixed(1)}" y="${wy}" width="${((w - 16) / cols - 5).toFixed(1)}" height="10" fill="${windowColor}" opacity="${(r + c) % 3 === 0 ? 0.9 : 0.45}"/>`;
    }
  }
  return out;
}

function svg(w, h, defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>\n`;
}

const skyGrad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

function landscape({ w = 1200, h = 900, seed = 1, sky = ['#E9E4D4', '#F7F6F2'], sun = true, buildings = false, dark = false, accent = '' }) {
  const defs = skyGrad('sky', ...sky) + `<radialGradient id="sun"><stop offset="0" stop-color="${C.goldL}"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient>`;
  let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
  b += contours(w, h, w * 0.72, h * 0.28, 9, dark ? C.goldL : C.gold, dark ? 0.18 : 0.22);
  if (sun) b += `<circle cx="${w * 0.72}" cy="${h * 0.3}" r="${w * 0.16}" fill="url(#sun)" opacity="0.7"/><circle cx="${w * 0.72}" cy="${h * 0.3}" r="${w * 0.06}" fill="${C.gold}" opacity="0.85"/>`;
  b += `<path d="${hill(w, h, h * 0.62, h * 0.07, seed + 1, 2)}" fill="${dark ? '#1d4d39' : '#C9D6CB'}"/>`;
  if (buildings) {
    const bx = w * 0.52;
    b += building(bx, h * 0.66, w * 0.09, h * 0.3, dark ? '#21503d' : '#A9BDB0', dark ? C.goldL : C.white);
    b += building(bx + w * 0.1, h * 0.66, w * 0.07, h * 0.42, dark ? '#285943' : '#97AF9F', dark ? C.goldL : C.white);
    b += building(bx + w * 0.18, h * 0.66, w * 0.08, h * 0.24, dark ? '#21503d' : '#A9BDB0', dark ? C.goldL : C.white);
  }
  b += `<path d="${hill(w, h, h * 0.7, h * 0.06, seed + 2, 3)}" fill="${dark ? C.green : '#7FA08B'}"/>`;
  b += forest(w, h * 0.7, 26, seed + 3, dark ? ['#3A7459', '#2f6650'] : ['#4F7E66', '#3A7459', '#5B8B71'], 1.1);
  b += `<path d="${hill(w, h, h * 0.8, h * 0.05, seed + 4, 2.4)}" fill="${dark ? '#174634' : C.green}"/>`;
  b += forest(w, h * 0.82, 18, seed + 5, dark ? ['#285943', '#1d4d39'] : ['#285943', '#1f4b38'], 1.6);
  b += `<path d="${hill(w, h, h * 0.92, h * 0.03, seed + 6, 1.5)}" fill="${C.forest}"/>`;
  b += accent;
  return svg(w, h, defs, b);
}

function leafMark(x, y, s, color) {
  return `<g transform="translate(${x},${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="2"><path d="M0,40 C0,10 20,-10 50,-10 C50,20 30,40 0,40 Z"/><path d="M0,40 L36,2"/></g>`;
}

const files = {
  'hero/hero.svg': landscape({ seed: 7, buildings: true, accent: leafMark(90, 120, 1.4, C.gold) }),
  'hero/pattern.svg': (() => {
    const w = 1600, h = 600;
    let b = `<rect width="${w}" height="${h}" fill="${C.forest}"/>`;
    b += contours(w, h, w * 0.78, h * 0.4, 16, C.goldL, 0.22);
    b += contours(w, h, w * 0.15, h * 1.1, 10, C.goldL, 0.12);
    b += `<path d="${hill(w, h, h * 0.86, h * 0.05, 3, 2)}" fill="#174634"/>`;
    b += forest(w, h * 0.88, 40, 11, ['#1d4d39', '#285943'], 1.3);
    return svg(w, h, '', b);
  })(),
  'about.svg': landscape({ seed: 21, sky: ['#DCE6DE', '#F7F6F2'], buildings: true, accent: (() => {
    // mesa e pessoas estilizadas
    let a = `<rect x="140" y="560" width="420" height="16" rx="8" fill="${C.forest}"/>`;
    a += `<rect x="170" y="576" width="10" height="120" fill="${C.forest}"/><rect x="520" y="576" width="10" height="120" fill="${C.forest}"/>`;
    a += `<rect x="250" y="470" width="150" height="92" rx="8" fill="${C.white}" stroke="${C.forest}" stroke-width="4"/>`;
    a += `<polyline points="268,540 300,515 330,528 360,495 382,500" fill="none" stroke="${C.gold}" stroke-width="5" stroke-linecap="round"/>`;
    for (const [x, c] of [[200, C.green], [470, C.gold]]) a += `<circle cx="${x}" cy="440" r="26" fill="${c}"/><path d="M${x - 44},560 C${x - 44},490 ${x + 44},490 ${x + 44},560 Z" fill="${c}"/>`;
    a += `<g transform="translate(600,500)"><rect x="-22" y="40" width="44" height="50" rx="6" fill="${C.gold}"/>${tree(0, 42, 1.3, C.light, 1)}</g>`;
    return a;
  })() }),
  'sustentabilidade.svg': landscape({ seed: 33, sky: ['#E8DFC7', '#F7F6F2'], accent: (() => {
    let a = '';
    for (const [x, s] of [[200, 1], [330, 0.8]]) {
      a += `<g transform="translate(${x},420) scale(${s})" stroke="${C.forest}" stroke-width="5" fill="none"><line x1="0" y1="0" x2="0" y2="260"/><circle cx="0" cy="0" r="7" fill="${C.forest}"/><line x1="0" y1="0" x2="0" y2="-90"/><line x1="0" y1="0" x2="78" y2="45"/><line x1="0" y1="0" x2="-78" y2="45"/></g>`;
    }
    a += `<g transform="translate(900,640)"><rect x="-90" y="0" width="180" height="70" fill="${C.gold}" transform="skewX(-20)"/><line x1="-60" y1="0" x2="-85" y2="70" stroke="${C.off}" stroke-width="3"/><line x1="0" y1="0" x2="-25" y2="70" stroke="${C.off}" stroke-width="3"/><line x1="60" y1="0" x2="35" y2="70" stroke="${C.off}" stroke-width="3"/></g>`;
    return a;
  })() }),
  'team-placeholder.svg': svg(400, 300, '', `<rect width="400" height="300" fill="#E3EBE5"/><circle cx="200" cy="120" r="52" fill="#B7C9BC"/><path d="M90,300 C90,200 310,200 310,300 Z" fill="#B7C9BC"/>`),
};

function scene(seed, sky, iconSvg, dark = false) {
  return landscape({ w: 1200, h: 750, seed, sky, dark, sun: !dark, accent: iconSvg });
}

const panel = (x, y, w, h, inner) =>
  `<g transform="translate(${x},${y})"><rect width="${w}" height="${h}" rx="18" fill="${C.white}" opacity="0.94"/>${inner}</g>`;

files['projects/processos.svg'] = scene(41, ['#E4EAE5', '#F7F6F2'], panel(110, 110, 400, 270, (() => {
  let i = '';
  const boxes = [[40, 40], [220, 40], [40, 170], [220, 170]];
  boxes.forEach(([x, y], k) => (i += `<rect x="${x}" y="${y}" width="140" height="62" rx="10" fill="${k % 2 ? C.gold : C.green}"/>`));
  i += `<path d="M180,71 L220,71 M110,102 L110,170 M290,102 L290,170 M180,201 L220,201" stroke="${C.forest}" stroke-width="4"/>`;
  return i;
})()));
files['projects/residuos.svg'] = scene(52, ['#E9E3D2', '#F7F6F2'], panel(110, 140, 420, 250, (() => {
  let i = '';
  [C.green, C.gold, '#5B8B71', C.forest].forEach((c, k) => {
    const x = 35 + k * 95;
    i += `<rect x="${x}" y="70" width="70" height="140" rx="8" fill="${c}"/><rect x="${x - 6}" y="56" width="82" height="16" rx="6" fill="${c}"/>`;
  });
  i += `<g transform="translate(210,135)" fill="none" stroke="${C.white}" stroke-width="5"><path d="M-12,-20 L0,-34 L12,-20"/></g>`;
  return i;
})()));
files['projects/esg.svg'] = scene(63, ['#E0E8E2', '#F7F6F2'], panel(110, 110, 420, 280, (() => {
  let i = '';
  [[120, C.green, 'E'], [210, C.gold, 'S'], [300, C.forest, 'G']].forEach(([x, c, l]) => {
    i += `<circle cx="${x}" cy="120" r="58" fill="${c}" opacity="0.92"/><text x="${x}" y="137" text-anchor="middle" font-family="Georgia,serif" font-size="48" fill="${C.white}">${l}</text>`;
  });
  i += `<rect x="60" y="210" width="300" height="12" rx="6" fill="#E3EBE5"/><rect x="60" y="210" width="190" height="12" rx="6" fill="${C.gold}"/>`;
  return i;
})()));
files['projects/documentos.svg'] = scene(74, ['#ECE6D6', '#F7F6F2'], panel(110, 110, 400, 280, (() => {
  let i = '';
  [0, 1, 2].forEach((k) => {
    const x = 50 + k * 110;
    i += `<path d="M${x},70 h40 l12,14 h48 v150 h-100 Z" fill="${[C.green, C.gold, C.forest][k]}"/>`;
    i += `<rect x="${x + 14}" y="110" width="72" height="8" rx="4" fill="${C.white}" opacity="0.7"/><rect x="${x + 14}" y="128" width="52" height="8" rx="4" fill="${C.white}" opacity="0.7"/>`;
  });
  return i;
})()));
files['articles/gestao-ambiental.svg'] = scene(85, ['#DDE7DF', '#F7F6F2'], leafMark(150, 200, 3, C.gold));
files['articles/recursos.svg'] = scene(96, ['#EBE3CF', '#F7F6F2'], `<g transform="translate(220,260)"><path d="M0,-90 C40,-30 60,0 60,30 A60,60 0 0 1 -60,30 C-60,0 -40,-30 0,-90 Z" fill="${C.green}"/><path d="M-25,30 A25,25 0 0 0 0,55" stroke="${C.white}" stroke-width="6" fill="none" stroke-linecap="round"/></g>`);
files['articles/esg.svg'] = scene(107, ['#1d4d39', C.forest], `<g transform="translate(240,270)" fill="none" stroke="${C.goldL}" stroke-width="5"><path d="M-120,40 L120,40"/><path d="M-100,40 L-100,-40 M-40,40 L-40,-40 M40,40 L40,-40 M100,40 L100,-40"/><path d="M-130,-40 L0,-110 L130,-40 Z"/></g>`, true);

for (const [name, content] of Object.entries(files)) {
  const path = `public/images/${name}`;
  mkdirSync(path.slice(0, path.lastIndexOf('/')), { recursive: true });
  writeFileSync(path, content);
}
console.log(`${Object.keys(files).length} ilustrações geradas em public/images/.`);
