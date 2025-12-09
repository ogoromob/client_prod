interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-brand-accent border-t-transparent rounded-full animate-spin`} />
      {message && (
        <p className="text-sm text-brand-text-secondary animate-pulse">{message}</p>
      )}
    </div>
  );
}

export function FullPageLoader({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-brand-bg-main flex items-center justify-center">
      <LoadingSpinner size="lg" message={message} />
    </div>
  );
}
