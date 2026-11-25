// Tiny dependency-free SVG charts.
const W = 600, H = 220, L = 60, R = 12, T = 14, B = 26;

function niceRange(min, max) {
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.12;
  return [min - pad, max + pad];
}

// series: [{ pts: [[x(ms), y]], cls: 'line'|'avg'|'dots' }]
export function lineChart(series, { yFmt = v => v, xFmt = x => '', empty = 'No data yet' } = {}) {
  const pts = series.flatMap(s => s.pts);
  if (!pts.length) return `<div class="chart-empty">${empty}</div>`;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  let x0 = Math.min(...xs), x1 = Math.max(...xs);
  if (x0 === x1) { x0 -= 86400000 * 3; x1 += 86400000 * 3; }
  const [y0, y1] = niceRange(Math.min(...ys), Math.max(...ys));
  const sx = x => L + ((x - x0) / (x1 - x0)) * (W - L - R);
  const sy = y => T + (1 - (y - y0) / (y1 - y0)) * (H - T - B);
  let g = '';
  for (let i = 0; i <= 3; i++) {
    const v = y0 + ((y1 - y0) * i) / 3, y = sy(v);
    g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y}" y2="${y}"/><text class="tk" x="${L - 6}" y="${y + 4}" text-anchor="end">${yFmt(v)}</text>`;
  }
  g += `<text class="tk" x="${L}" y="${H - 6}">${xFmt(x0)}</text><text class="tk" x="${W - R}" y="${H - 6}" text-anchor="end">${xFmt(x1)}</text>`;
  for (const s of series) {
    if (!s.pts.length) continue;
    const d = s.pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join('');
    if (s.cls !== 'dots') g += `<path class="${s.cls || 'line'}" d="${d}"/>`;
    if (s.cls !== 'avg') g += s.pts.map(p => `<circle class="dot" cx="${sx(p[0]).toFixed(1)}" cy="${sy(p[1]).toFixed(1)}" r="3.5"/>`).join('');
  }
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
}

export function barChart(labels, values, { yFmt = v => v, empty = 'No data yet' } = {}) {
  if (!values.some(v => v > 0)) return `<div class="chart-empty">${empty}</div>`;
  const max = Math.max(...values) * 1.1;
  const n = values.length, bw = (W - L - R) / n;
  let g = '';
  for (let i = 0; i <= 2; i++) {
    const v = (max * i) / 2, y = T + (1 - v / max) * (H - T - B);
    g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y}" y2="${y}"/><text class="tk" x="${L - 6}" y="${y + 4}" text-anchor="end">${yFmt(v)}</text>`;
  }
  values.forEach((v, i) => {
    const h = (v / max) * (H - T - B), x = L + i * bw + bw * 0.18;
    g += `<rect class="bar" x="${x.toFixed(1)}" y="${(H - B - h).toFixed(1)}" width="${(bw * 0.64).toFixed(1)}" height="${h.toFixed(1)}" rx="3"/>`;
    g += `<text class="tk" x="${(x + bw * 0.32).toFixed(1)}" y="${H - 6}" text-anchor="middle">${labels[i]}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
}
