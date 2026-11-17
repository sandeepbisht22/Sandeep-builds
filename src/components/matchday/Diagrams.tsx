const CHALK = "rgb(242 234 219 / 0.55)";

/** Chalk tactics board: the full-back's lane, with the overlap run up the wing. */
export function PitchDiagram() {
  return (
    <svg viewBox="0 0 300 200" className="h-auto w-full" role="img" aria-label="Football pitch with the full-back position marked">
      <g fill="none" stroke={CHALK} strokeWidth={1.6}>
        <rect x={8} y={8} width={284} height={184} rx={2} />
        <line x1={150} y1={8} x2={150} y2={192} />
        <circle cx={150} cy={100} r={26} />
        <rect x={8} y={52} width={42} height={96} />
        <rect x={250} y={52} width={42} height={96} />
        <rect x={8} y={78} width={14} height={44} />
        <rect x={278} y={78} width={14} height={44} />
      </g>
      <path d="M78 172 C120 176 170 170 228 150" fill="none" stroke="#ff8a1f" strokeWidth={2.4} strokeDasharray="5 6" />
      <path d="M222 144 L230 150 L221 156" fill="none" stroke="#ff8a1f" strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={70} cy={170} r={12} fill="#ff8a1f" opacity={0.25} />
      <circle cx={70} cy={170} r={7} fill="#ff8a1f" />
      {[
        [40, 100],
        [70, 30],
        [70, 72],
        [70, 128],
        [118, 60],
        [118, 140],
        [150, 100],
        [190, 40],
        [190, 160],
        [212, 100],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill={CHALK} />
      ))}
    </svg>
  );
}

/** The cricket field from above: boundary, inner ring, pitch, and the bowler's run-up. */
export function FieldDiagram() {
  return (
    <svg viewBox="0 0 300 200" className="h-auto w-full" role="img" aria-label="Cricket field with the bowler's run-up marked">
      <g fill="none" stroke={CHALK} strokeWidth={1.6}>
        <ellipse cx={150} cy={100} rx={140} ry={92} />
        <ellipse cx={150} cy={100} rx={78} ry={56} strokeDasharray="4 6" />
      </g>
      <rect x={140} y={66} width={20} height={68} fill="rgb(242 234 219 / 0.12)" stroke={CHALK} strokeWidth={1.2} />
      {[64, 136].map((y) => (
        <g key={y} stroke="#f2eadb" strokeWidth={1.6}>
          <line x1={146} y1={y} x2={146} y2={y + (y < 100 ? 6 : -6)} />
          <line x1={150} y1={y} x2={150} y2={y + (y < 100 ? 6 : -6)} />
          <line x1={154} y1={y} x2={154} y2={y + (y < 100 ? 6 : -6)} />
        </g>
      ))}
      <path d="M150 178 L150 150" stroke="#ff8a1f" strokeWidth={2.4} strokeDasharray="4 5" />
      <circle cx={150} cy={182} r={6} fill="#ff8a1f" />
      <path d="M150 140 C162 116 158 92 150 70" fill="none" stroke="#ff8a1f" strokeWidth={2} opacity={0.8} />
      <circle cx={150} cy={70} r={3.5} fill="#e9dcc6" />
    </svg>
  );
}
