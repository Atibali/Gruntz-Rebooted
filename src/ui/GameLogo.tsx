import React from 'react';

interface GameLogoProps {
  className?: string;
  iconClassName?: string;
}

export function GameLogo({ className = '', iconClassName = '' }: GameLogoProps) {
  return (
    <div className={`game-logo ${className}`}>
      <svg
        aria-hidden="true"
        className={`game-logo__mark ${iconClassName}`}
        viewBox="0 0 64 64"
        fill="none"
      >
        <path d="M32 3 57 17v30L32 61 7 47V17L32 3Z" fill="#06251F" stroke="#34D399" strokeWidth="2" />
        <path d="M14 21h8v-6h8v6h8v-6h8v6h4v22h-8v6h-8v-6h-8v6h-8v-6h-4V21Z" fill="#10B981" />
        <path d="M21 27h7v8h-7zm15 0h7v8h-7z" fill="#07111A" />
        <path d="M27 39h10v4H27z" fill="#A7F3D0" />
        <path d="M3 32h7m44 0h7M32 3v6m0 46v6" stroke="#67E8F9" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="game-logo__wordmark">
        <span className="game-logo__title">GRUNTZ:</span>
        <span className="game-logo__subtitle">REBOOTED</span>
      </span>
    </div>
  );
}
