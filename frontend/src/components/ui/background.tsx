import { cn } from '@/lib/utils';

interface AppBackgroundProps {
  className?: string;
}

/**
 * Global Altiora backdrop. Decorative layers are intentionally subtle so
 * content remains enterprise-clean and readable in both color schemes.
 */
export function AppBackground({ className }: AppBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#F8FAFC] dark:bg-[#071329]',
        className,
      )}
    >
      <div className="absolute inset-0 opacity-60 dark:opacity-35 [background-image:linear-gradient(to_right,rgba(6,42,109,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,42,109,0.07)_1px,transparent_1px)] [background-size:48px_48px] dark:[background-image:linear-gradient(to_right,rgba(52,198,243,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(52,198,243,0.1)_1px,transparent_1px)]" />

      <div className="absolute -left-48 -top-56 h-[42rem] w-[42rem] rounded-full bg-[#0B4EA2]/15 blur-[110px] dark:bg-[#11B5E4]/15" />
      <div className="absolute -right-56 top-[18%] h-[38rem] w-[38rem] rounded-full bg-[#11B5E4]/15 blur-[120px] dark:bg-[#34C6F3]/15" />
      <div className="absolute bottom-[-22rem] left-[28%] h-[42rem] w-[42rem] rounded-full bg-[#062A6D]/10 blur-[130px] dark:bg-[#0B4EA2]/15" />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#11B5E4]/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/5 to-background/30" />
    </div>
  );
}
