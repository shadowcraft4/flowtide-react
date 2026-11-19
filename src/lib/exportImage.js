/** Draws the shareable progress card and returns it as a PNG data URL. */
export function makeProgressImage(stats, goal) {
  const c = document.createElement('canvas');
  c.width = 800; c.height = 400;
  const x = c.getContext('2d');

  const bg = x.createLinearGradient(0, 0, 800, 400);
  bg.addColorStop(0, '#15131d'); bg.addColorStop(1, '#0d0b14');
  x.fillStyle = bg; x.fillRect(0, 0, 800, 400);

  x.fillStyle = '#f4f2f8';
  x.font = '600 30px sans-serif';
  x.fillText('Flowtide · Progress', 40, 56);
  x.font = '20px sans-serif';
  x.fillText(`${stats.streak} day streak`, 40, 110);
  x.fillText(`${Math.round(stats.todayMin)} min today`, 290, 110);
  x.fillText(`${Math.round(stats.weekMin)} min this week`, 540, 110);

  const barGrad = x.createLinearGradient(40, 0, 760, 0);
  barGrad.addColorStop(0, '#6d35e0'); barGrad.addColorStop(1, '#c9b8ff');
  x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(40, 140, 720, 14);
  x.fillStyle = barGrad; x.fillRect(40, 140, 720 * Math.min(1, stats.weekMin / goal), 14);

  const max = Math.max(...stats.week.map(d => d.mins), 1);
  x.font = '16px sans-serif';
  const colGrad = x.createLinearGradient(0, 220, 0, 370);
  colGrad.addColorStop(0, '#c9b8ff'); colGrad.addColorStop(1, '#8b5cf6');
  stats.week.forEach((d, i) => {
    const bx = 60 + i * 100, h = Math.max(2, (d.mins / max) * 150);
    x.fillStyle = colGrad; x.fillRect(bx, 370 - h, 55, h);
    x.fillStyle = '#9893a8'; x.fillText(d.label, bx, 390);
  });

  return c.toDataURL('image/png');
}
