// Notes logo: a stack of note cards with a bullet list on the front card.
export default function Logo({ className = 'logo', size }) {
  const s = '#1e7fd0'; const l = '#9cc8ff';
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <g strokeWidth="30" strokeLinejoin="round" strokeLinecap="round" stroke={s}>
        <rect x="24" y="24" width="464" height="464" rx="48" fill={l} />
        <rect x="24" y="24" width="392" height="464" rx="48" fill={l} />
        <rect x="24" y="24" width="328" height="464" rx="48" fill="#fff" />
        <g fill={l} strokeWidth="20">
          <circle cx="104" cy="128" r="30" /><circle cx="104" cy="256" r="30" /><circle cx="104" cy="384" r="30" />
        </g>
        <g strokeWidth="20" fill="none"><path d="M186 128h126M186 256h126M186 384h126" /></g>
      </g>
    </svg>
  );
}
