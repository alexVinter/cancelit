import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: number;
}

export const LogoIcon: React.FC<LogoIconProps> = ({
  className = "w-[22px] h-[22px]",
  size
}) => {
  return (
    <svg
      viewBox="0 0 192 192"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="16.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Логотип Ущемись"
    >
      {/* Левая ветвь буквы «у» */}
      <path d="M 68,66 C 72,86 82,98 96,98" />
      
      {/* Правая ветвь переходит в хвостик и закручивается в крупную фирменную петлю Threads */}
      <path d="M 124,66 L 96,98 L 78,126 C 66,140 56,138 46,128 C 34,114 32,94 32,80 C 32,44 58,26 96,26 C 138,26 164,52 164,96 C 164,138 136,166 96,166 C 64,166 42,148 42,124" />
    </svg>
  );
};
