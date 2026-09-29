import React from 'react';

interface VerifiedBadgeProps {
  className?: string;
  size?: number | string;
  title?: string;
}

/**
 * Reusable Instagram / Telegram style verified badge ("голубая галочка").
 * Features the signature scalloped rosette silhouette with a solid sky-blue fill (#0095F6)
 * and a crisp, perfectly centered white checkmark.
 */
export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  className = 'w-3.5 h-3.5 shrink-0',
  title = 'Подтверждённый профиль'
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      {title && <title>{title}</title>}
      {/* Signature Instagram / Telegram Scalloped Rosette (Sky Blue) */}
      <path
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
        fill="#0095F6"
      />
      {/* Crisp White Checkmark */}
      <path
        d="M10.54 16.2L6.8 12.46l1.41-1.42 2.33 2.33 5.23-5.23 1.42 1.42-6.65 6.64z"
        fill="#FFFFFF"
      />
    </svg>
  );
};
