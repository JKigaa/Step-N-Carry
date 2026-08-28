import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  onClick?: () => void;
}

export function Logo({ className, showText = true, onClick }: LogoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 font-bold tracking-tight transition-opacity hover:opacity-90',
        className
      )}
      aria-label="CV Chap home"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <FileText className="h-5 w-5" aria-hidden="true" />
      </span>
      {showText && (
        <span className="text-lg">
          CV <span className="text-primary">Chap</span>
        </span>
      )}
    </button>
  );
}
