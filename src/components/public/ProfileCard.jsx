import React, { useRef, useCallback } from 'react';

// LinkedIn SVG icon (inline — no external dependency needed)
const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// Checkerboard placeholder (matches reference screenshot)
const CheckerPlaceholder = () => (
  <div
    className="w-full h-full"
    style={{
      background:
        'repeating-conic-gradient(#e5e7eb 0% 25%, #f3f4f6 0% 50%) 0 0 / 24px 24px',
    }}
  />
);

const ProfileCardComponent = ({
  avatarUrl = '',
  name = 'Team Member',
  title = 'Role',
  linkedinUrl = '',
  className = '',
}) => {
  const cardRef = useRef(null);

  // Lightweight 3D tilt — pure CSS transform, no RAF loop needed
  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = ((e.clientX - left) / width - 0.5) * 10;   // ±5 deg
    const y = ((e.clientY - top)  / height - 0.5) * -10;
    card.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateZ(6px)`;
  }, []);

  const handleMouseEnter = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform 0.12s ease, box-shadow 0.3s ease';
    card.style.boxShadow = '0 24px 48px -8px rgba(9,49,79,0.22), 0 8px 20px -4px rgba(9,49,79,0.12)';
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform 0.55s ease, box-shadow 0.4s ease';
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    card.style.boxShadow = '0 4px 20px -4px rgba(9,49,79,0.10)';
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-[20px] bg-gray-100 select-none cursor-default group ${className}`}
      style={{
        aspectRatio: '4 / 5',
        boxShadow: '0 4px 20px -4px rgba(9,49,79,0.10)',
        transition: 'transform 0.55s ease, box-shadow 0.4s ease',
        willChange: 'transform',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Full-card image / placeholder ───────────────────────── */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="absolute inset-0">
          <CheckerPlaceholder />
        </div>
      )}

      {/* Subtle bottom gradient so text stays readable over any image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(9,49,79,0.30) 0%, transparent 45%)',
        }}
      />

      {/* ── Floating info strip ─────────────────────────────────── */}
      {/* Sits above the image with margin on all sides, image visible below */}
      <div
        className="absolute left-3 right-3 bottom-3 flex items-center justify-between px-4 py-3 bg-white rounded-2xl"
        style={{
          boxShadow: '0 8px 24px -4px rgba(9,49,79,0.18), 0 2px 8px -2px rgba(9,49,79,0.10)',
        }}
      >
        {/* Name + Role */}
        <div className="min-w-0 pr-3">
          <h3
            className="font-black text-[#0F2843] uppercase tracking-tight leading-tight truncate"
            style={{ fontSize: 'clamp(13px, 2.5vw, 16px)' }}
          >
            {name}
          </h3>
          <p
            className="font-bold uppercase tracking-wider mt-0.5 truncate"
            style={{
              fontSize: 'clamp(9px, 1.8vw, 11px)',
              color: 'var(--ascent-color, #0099CC)',
              letterSpacing: '0.08em',
            }}
          >
            {title}
          </p>
        </div>

        {/* LinkedIn Button */}
        {linkedinUrl ? (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center rounded-xl shrink-0 transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ width: '40px', height: '40px', background: '#0077B5' }}
            aria-label={`${name} on LinkedIn`}
          >
            <LinkedInIcon />
          </a>
        ) : (
          <div
            className="flex items-center justify-center rounded-xl shrink-0 opacity-30"
            style={{ width: '40px', height: '40px', background: '#0077B5' }}
            aria-hidden="true"
          >
            <LinkedInIcon />
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);
export default ProfileCard;
