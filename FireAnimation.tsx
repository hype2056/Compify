import React from 'react';

interface FireAnimationProps {
  streak: number;
}

const FireAnimation: React.FC<FireAnimationProps> = ({ streak }) => {
  const getStreakColor = () => {
    if (streak >= 15) return '#a855f7';
    if (streak >= 10) return '#22c55e';
    if (streak >= 5) return '#3b82f6';
    return '#ef4444';
  };

  const getStreakClass = () => {
    if (streak >= 15) return 'streak-purple';
    if (streak >= 10) return 'streak-green';
    if (streak >= 5) return 'streak-blue';
    return 'streak-red';
  };

  const color = getStreakColor();

  if (streak === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <div className="fire-container">
        <svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
          {/* Spark particles */}
          <circle className="flame one" cx="30" cy="32" r="2" fill={color} opacity="0.8" />
          <circle className="flame two" cx="24" cy="38" r="1.5" fill={color} opacity="0.6" />

          {/* Main flame layers */}
          <path
            className="flame-main one"
            d="M30 10 C30 10, 45 30, 42 50 C40 60, 35 68, 30 70 C25 68, 20 60, 18 50 C15 30, 30 10, 30 10Z"
            fill={color}
            opacity="0.9"
          />
          <path
            className="flame-main two"
            d="M30 18 C30 18, 40 34, 38 48 C37 55, 34 62, 30 64 C26 62, 23 55, 22 48 C20 34, 30 18, 30 18Z"
            fill={color}
            opacity="0.7"
            filter="brightness(1.3)"
          />
          <path
            className="flame-main three"
            d="M30 28 C30 28, 36 40, 35 50 C34 56, 32 60, 30 61 C28 60, 26 56, 25 50 C24 40, 30 28, 30 28Z"
            fill="#fbbf24"
            opacity="0.8"
          />
          <path
            className="flame-main four"
            d="M30 38 C30 38, 34 46, 33 52 C33 56, 31 58, 30 58 C29 58, 27 56, 27 52 C26 46, 30 38, 30 38Z"
            fill="#fef3c7"
            opacity="0.9"
          />
          <path
            className="flame-main five"
            d="M30 44 C30 44, 32 50, 32 54 C32 56, 31 57, 30 57 C29 57, 28 56, 28 54 C28 50, 30 44, 30 44Z"
            fill="white"
            opacity="0.7"
          />
        </svg>
      </div>
      <span className={`streak-badge ${getStreakClass()}`}>
        {streak}x
      </span>
    </div>
  );
};

export default FireAnimation;
