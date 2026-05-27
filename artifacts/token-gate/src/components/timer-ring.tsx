import { motion } from "framer-motion";

export function TimerRing({ 
  secondsRemaining, 
  windowMinutes, 
  size = 120,
  strokeWidth = 6
}: { 
  secondsRemaining: number; 
  windowMinutes: number;
  size?: number;
  strokeWidth?: number;
}) {
  const totalSeconds = windowMinutes * 60;
  const progress = Math.max(0, Math.min(1, secondsRemaining / totalSeconds));
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  const isCritical = progress < 0.1; // Less than 10% remaining

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg
        className="absolute inset-0 transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={isCritical ? "text-destructive" : "text-primary"}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "linear" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      
      {/* Inner Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
        <span className={`text-3xl font-bold tracking-tighter tabular-nums ${isCritical ? "text-destructive" : "text-foreground"}`}>
          {secondsRemaining.toString().padStart(3, '0')}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">SEC</span>
      </div>
    </div>
  );
}
