export function phaseText(mode, phase, running) {
  if (mode === 'stopwatch') return running ? 'Stopwatch running' : 'Stopwatch';
  if (mode === 'countdown') return running ? 'Countdown running' : 'Countdown ready';
  if (phase === 'focus') return running ? 'Focusing' : 'Focus ready';
  if (phase === 'longbreak') return 'Long break' + (running ? '' : ' ready');
  return 'Break' + (running ? '' : ' ready');
}

export function summaryText(mode, S) {
  if (mode === 'pomodoro') return `Focus ${S.focus}m · Break ${S.brk}m · Long break ${S.longBrk}m every ${S.longEvery}`;
  if (mode === 'countdown') return `Countdown length: ${S.cd} min`;
  return 'Counts up until you stop it';
}

export function startLabel(running, elapsedMs) {
  return running ? 'Pause' : elapsedMs > 0 ? 'Resume' : 'Start';
}
