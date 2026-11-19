export function phaseText(mode, phase, running) {
  if (mode === 'stopwatch') return running ? 'stopwatch running' : 'stopwatch';
  if (mode === 'countdown') return running ? 'countdown running' : 'countdown ready';
  if (phase === 'focus') return running ? 'focusing' : 'focus ready';
  if (phase === 'longbreak') return 'long break' + (running ? '' : ' ready');
  return 'break' + (running ? '' : ' ready');
}

export function summaryText(mode, S) {
  if (mode === 'pomodoro') return `${S.focus} min focus, ${S.brk} min break, ${S.longBrk} min long break every ${S.longEvery}`;
  if (mode === 'countdown') return `countdown length ${S.cd} min`;
  return 'counts up until you stop it';
}

export function startLabel(running, elapsedMs) {
  return running ? 'pause' : elapsedMs > 0 ? 'resume' : 'start';
}
