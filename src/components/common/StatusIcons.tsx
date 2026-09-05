import React from 'react';

interface IconProps {
  className?: string;
  title?: string;
}

export const PassIcon: React.FC<IconProps> = ({ className = "w-4 h-4", title = "Hợp lệ" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label={title}
  >
    <title>{title}</title>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DenyIcon: React.FC<IconProps> = ({ className = "w-4 h-4", title = "Không hợp lệ" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label={title}
  >
    <title>{title}</title>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.5 9.5L9.5 14.5M9.5 9.5L14.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
