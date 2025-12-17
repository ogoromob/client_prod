import { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  endDate: Date;
  onExpire?: () => void;
  showWarning?: boolean;
  className?: string;
}

export function CountdownTimer({ 
  endDate, 
  onExpire, 
  showWarning = true,
  className 
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const difference = end - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.expired && onExpire) {
        onExpire();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  const isWarning = timeLeft.days === 0 && timeLeft.hours < 24;
  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 1;

  if (timeLeft.expired) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20",
        className
      )}>
        <AlertCircle className="h-5 w-5 text-red-500" />
        <span className="text-red-500 font-semibold">Session Terminée</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-4 px-6 py-4 rounded-xl border backdrop-blur-sm transition-all duration-300",
      isUrgent && "bg-red-500/10 border-red-500/30 animate-pulse",
      isWarning && !isUrgent && "bg-orange-500/10 border-orange-500/30",
      !isWarning && "bg-dark-800/50 border-gray-700",
      className
    )}>
      <Clock className={cn(
        "h-6 w-6",
        isUrgent && "text-red-500",
        isWarning && !isUrgent && "text-orange-500",
        !isWarning && "text-primary-500"
      )} />
      
      <div className="flex gap-2">
        <TimeUnit value={timeLeft.days} label="Jours" isWarning={isWarning} isUrgent={isUrgent} />
        <span className="text-gray-500">:</span>
        <TimeUnit value={timeLeft.hours} label="Heures" isWarning={isWarning} isUrgent={isUrgent} />
        <span className="text-gray-500">:</span>
        <TimeUnit value={timeLeft.minutes} label="Min" isWarning={isWarning} isUrgent={isUrgent} />
        <span className="text-gray-500">:</span>
        <TimeUnit value={timeLeft.seconds} label="Sec" isWarning={isWarning} isUrgent={isUrgent} />
      </div>

      {showWarning && isWarning && (
        <div className="ml-4 flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <span className={cn(
            isUrgent ? "text-red-400" : "text-orange-400"
          )}>
            Dépôts bientôt fermés !
          </span>
        </div>
      )}
    </div>
  );
}

function TimeUnit({ 
  value, 
  label, 
  isWarning, 
  isUrgent 
}: { 
  value: number; 
  label: string; 
  isWarning: boolean; 
  isUrgent: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        "text-2xl font-bold tabular-nums transition-colors",
        isUrgent && "text-red-400",
        isWarning && !isUrgent && "text-orange-400",
        !isWarning && "text-white"
      )}>
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-xs text-gray-500 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
