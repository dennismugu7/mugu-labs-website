/**
 * The Mugu Labs robot, rebuilt as vector so it stays crisp at any size.
 * `id` keeps the gradient definitions unique when the mark appears twice.
 */

type Props = {
  className?: string;
  id?: string;
  title?: string;
};

export default function Logo({ className, id = "logo", title }: Props) {
  const bodyId = `${id}-body`;
  const antennaId = `${id}-antenna`;

  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id={bodyId} x1="18" y1="14" x2="84" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2fb7cf" />
          <stop offset="0.36" stopColor="#5b7fe8" />
          <stop offset="0.68" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#d946ef" />
        </linearGradient>
        <linearGradient id={antennaId} x1="30" y1="10" x2="92" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2fb7cf" />
          <stop offset="1" stopColor="#6d8ae9" />
        </linearGradient>
      </defs>

      {/* antennae */}
      <g stroke={`url(#${antennaId})`} strokeWidth="7" strokeLinecap="round" fill="none">
        <path d="M48 46 L36 20" />
        <path d="M72 46 L84 20" />
      </g>
      <circle cx="34" cy="17" r="8.5" fill="#2fb7cf" />
      <circle cx="86" cy="17" r="8.5" fill="#57a9df" />

      {/* head: outer squircle with a rounded-rect face cut out of it */}
      <path
        fill={`url(#${bodyId})`}
        fillRule="evenodd"
        d="M60 34
           C 86 34, 106 50, 106 72
           C 106 94, 86 110, 60 110
           C 34 110, 14 94, 14 72
           C 14 50, 34 34, 60 34 Z
           M44 52
           C 36.3 52, 30 58.3, 30 66
           L 30 80
           C 30 87.7, 36.3 94, 44 94
           L 76 94
           C 83.7 94, 90 87.7, 90 80
           L 90 66
           C 90 58.3, 83.7 52, 76 52 Z"
      />

      {/* eyes */}
      <circle cx="49" cy="73" r="7.5" fill={`url(#${bodyId})`} />
      <circle cx="71" cy="73" r="7.5" fill={`url(#${bodyId})`} />
    </svg>
  );
}
