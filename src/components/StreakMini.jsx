import { Card, ProgressBar } from './ui/primitives';

export default function StreakMini({ streak, goalPct, goalReached }) {
  return (
    <Card className="mx-auto mt-5 max-w-[440px] px-5 py-3.5 text-left">
      <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div>
            <b data-streak className="block font-display text-2xl font-extrabold leading-tight text-accent [font-stretch:85%]">{streak}</b>
            <span className="text-[11px] text-muted">day streak</span>
          </div>
        </div>
        <div className="hidden w-px self-stretch bg-line sm:block" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex justify-between text-[11.5px] text-muted">
            <span>weekly goal</span>
            <span data-goal-pct>{Math.round(goalPct)}%</span>
          </div>
          <ProgressBar pct={goalPct} className="my-0.5 h-[7px]" />
          {goalReached && <span data-reward className="text-[11px] text-good">goal reached this week</span>}
        </div>
      </div>
    </Card>
  );
}
