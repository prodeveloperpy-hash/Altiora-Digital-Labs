import { clamp } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MatchScoreProps {
  /** Score from 0 to 100. */
  score: number;
  size?: number;
  className?: string;
}

/** Circular gauge visualizing a card's match score. */
export function MatchScore({ score, size = 64, className }: MatchScoreProps) {
  const value = Math.round(clamp(score, 0, 100));
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const tone =
    value >= 80 ? 'text-success' : value >= 55 ? 'text-primary' : 'text-warning';

  return (
    <div
      className={cn('relative inline-flex flex-none items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Match score ${value} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-[stroke-dashoffset] duration-700 ease-out', tone)}
          stroke="currentColor"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-base font-bold leading-none', tone)}>{value}</span>
        <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
          match
        </span>
      </span>
    </div>
  );
}
