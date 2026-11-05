import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  inverted?: boolean;
  href?: string;
}

export function Logo({
  className = '',
  size = 'md',
  showSubtitle = false,
  inverted = false,
  href = '/',
}: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const Content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Shield with Verified Checkmark SVG Icon */}
      <div
        className={`relative ${iconSizes[size]} rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
          inverted ? 'bg-white/10 ring-1 ring-white/20' : 'bg-[#2347F5] shadow-[#2347F5]/20'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white"
          aria-hidden="true"
        >
          {/* Shield Outline & Subtle Fill */}
          <path
            d="M12 2.5L4 5.5V11C4 16.5 7.4 21.5 12 22.5C16.6 21.5 20 16.5 20 11V5.5L12 2.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Internal Checkmark for Verification */}
          <path
            d="M9 11.8L11 13.8L15 9.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-bold tracking-tight leading-none ${textSizes[size]} ${
            inverted ? 'text-white' : 'text-[#0A1226]'
          }`}
        >
          Invoice<span className={inverted ? 'text-[#93C5FD]' : 'text-[#2347F5]'}>Guard</span>
        </span>
        {showSubtitle && (
          <span
            className={`text-[10px] uppercase font-semibold tracking-wider mt-0.5 ${
              inverted ? 'text-[#94A3B8]' : 'text-[#667085]'
            }`}
          >
            Accounts Payable Defense
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F5] rounded-lg"
      >
        {Content}
      </Link>
    );
  }

  return Content;
}
