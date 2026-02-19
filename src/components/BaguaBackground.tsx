export function BaguaBackground({ className }: { className?: string }) {
  const cx = 400;
  const cy = 400;

  // Later Heaven (后天八卦) arrangement, starting from South (top in Chinese cosmo)
  const trigrams = [
    { name: '离', char: '☲', angle: 0, lines: [true, false, true] },
    { name: '坤', char: '☷', angle: 45, lines: [false, false, false] },
    { name: '兑', char: '☱', angle: 90, lines: [false, true, true] },
    { name: '乾', char: '☰', angle: 135, lines: [true, true, true] },
    { name: '坎', char: '☵', angle: 180, lines: [false, true, false] },
    { name: '艮', char: '☶', angle: 225, lines: [true, false, false] },
    { name: '震', char: '☳', angle: 270, lines: [false, false, true] },
    { name: '巽', char: '☴', angle: 315, lines: [true, true, false] },
  ];

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Yin-Yang parameters
  const R = 70;
  const yinYangPath = `
    M ${cx},${cy - R}
    A ${R},${R} 0 0,1 ${cx},${cy + R}
    A ${R / 2},${R / 2} 0 0,1 ${cx},${cy}
    A ${R / 2},${R / 2} 0 0,0 ${cx},${cy - R}
    Z
  `;

  return (
    <svg
      viewBox="0 0 800 800"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outermost decorative rings */}
      {[375, 355, 335].map((r, i) => (
        <circle
          key={`outer-${i}`}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#B8925A"
          strokeWidth={i === 0 ? 1.2 : 0.5}
          opacity={0.35}
        />
      ))}

      {/* Sector dividing lines (8 sections) */}
      {trigrams.map(({ angle }) => {
        const rad = toRad(angle + 22.5);
        const x = cx + 375 * Math.sin(rad);
        const y = cy - 375 * Math.cos(rad);
        return (
          <line
            key={`sector-${angle}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#B8925A"
            strokeWidth={0.5}
            opacity={0.2}
          />
        );
      })}

      {/* Trigram lines */}
      {trigrams.map(({ lines, angle }) => {
        const rad = toRad(angle);
        const baseR = 295;
        return lines.map((isYang, lineIdx) => {
          const r = baseR - lineIdx * 14;
          const perpRad = toRad(angle + 90);
          const halfLen = 20;
          const x1c = cx + r * Math.sin(rad) - halfLen * Math.sin(perpRad);
          const y1c = cy - r * Math.cos(rad) + halfLen * Math.cos(perpRad);
          const x2c = cx + r * Math.sin(rad) + halfLen * Math.sin(perpRad);
          const y2c = cy - r * Math.cos(rad) - halfLen * Math.cos(perpRad);

          if (isYang) {
            return (
              <line
                key={`line-${angle}-${lineIdx}`}
                x1={x1c}
                y1={y1c}
                x2={x2c}
                y2={y2c}
                stroke="#B8925A"
                strokeWidth={2}
                opacity={0.6}
              />
            );
          } else {
            const mx1 = cx + r * Math.sin(rad) - (halfLen - 7) * Math.sin(perpRad);
            const my1 = cy - r * Math.cos(rad) + (halfLen - 7) * Math.cos(perpRad);
            const mx2 = cx + r * Math.sin(rad) + (halfLen - 7) * Math.sin(perpRad);
            const my2 = cy - r * Math.cos(rad) - (halfLen - 7) * Math.cos(perpRad);
            return (
              <g key={`line-${angle}-${lineIdx}`}>
                <line x1={x1c} y1={y1c} x2={mx1} y2={my1} stroke="#B8925A" strokeWidth={2} opacity={0.6} />
                <line x1={mx2} y1={my2} x2={x2c} y2={y2c} stroke="#B8925A" strokeWidth={2} opacity={0.6} />
              </g>
            );
          }
        });
      })}

      {/* Inner rings */}
      {[245, 230].map((r, i) => (
        <circle
          key={`inner-${i}`}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#B8925A"
          strokeWidth={0.6}
          opacity={0.25}
        />
      ))}

      {/* Trigram Unicode symbols */}
      {trigrams.map(({ char, angle }) => {
        const rad = toRad(angle);
        const symR = 215;
        const symX = cx + symR * Math.sin(rad);
        const symY = cy - symR * Math.cos(rad);
        return (
          <text
            key={`sym-${angle}`}
            x={symX}
            y={symY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="24"
            fill="#B8925A"
            opacity={0.55}
          >
            {char}
          </text>
        );
      })}

      {/* Trigram Chinese names */}
      {trigrams.map(({ name, angle }) => {
        const rad = toRad(angle);
        const nameR = 180;
        const nameX = cx + nameR * Math.sin(rad);
        const nameY = cy - nameR * Math.cos(rad);
        return (
          <text
            key={`name-${angle}`}
            x={nameX}
            y={nameY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="16"
            fill="#1A0F05"
            opacity={0.4}
            fontFamily="var(--font-serif), serif"
          >
            {name}
          </text>
        );
      })}

      {/* Inner ring for taiji */}
      <circle cx={cx} cy={cy} r={85} fill="none" stroke="#B8925A" strokeWidth={0.8} opacity={0.3} />

      {/* Taiji (Yin-Yang) */}
      <circle cx={cx} cy={cy} r={R} fill="#F7F3EC" />
      <path d={yinYangPath} fill="#1A0F05" opacity={0.75} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#B8925A" strokeWidth={0.8} opacity={0.5} />
      <circle cx={cx} cy={cy - R / 2} r={R / 6} fill="#F7F3EC" />
      <circle cx={cx} cy={cy + R / 2} r={R / 6} fill="#1A0F05" opacity={0.75} />
    </svg>
  );
}
