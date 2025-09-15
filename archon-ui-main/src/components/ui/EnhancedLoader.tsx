import { cn } from '../../lib/utils';

interface EnhancedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'pulse' | 'dots';
  className?: string;
  text?: string;
}

/**
 * Enhanced loading component with modern animations and multiple variants
 */
export function EnhancedLoader({ 
  size = 'md', 
  variant = 'spinner', 
  className,
  text 
}: EnhancedLoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const SpinnerLoader = () => (
    <div className={cn(
      'animate-spin rounded-full border-2 border-transparent',
      'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
      'p-[2px]',
      sizeClasses[size]
    )}>
      <div className="w-full h-full rounded-full bg-background" />
    </div>
  );

  const PulseLoader = () => (
    <div className={cn(
      'rounded-full animate-pulse',
      'bg-gradient-to-r from-blue-500 to-purple-500',
      sizeClasses[size]
    )} />
  );

  const DotsLoader = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-gradient-to-r from-blue-500 to-purple-500',
            'animate-bounce',
            size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5'
          )}
          style={{ 
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'pulse':
        return <PulseLoader />;
      case 'dots':
        return <DotsLoader />;
      default:
        return <SpinnerLoader />;
    }
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3',
      className
    )}>
      {renderLoader()}
      {text && (
        <p className={cn(
          'text-sm text-muted-foreground animate-pulse',
          'font-medium tracking-wide'
        )}>
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * Full-screen loading overlay component
 */
export function LoadingOverlay({ 
  isVisible = false,
  text = "Loading...",
  variant = 'spinner'
}: {
  isVisible?: boolean;
  text?: string;
  variant?: 'spinner' | 'pulse' | 'dots';
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative glass-card p-8 rounded-2xl">
        <EnhancedLoader 
          size="lg" 
          variant={variant}
          text={text}
          className="text-center"
        />
      </div>
    </div>
  );
}
