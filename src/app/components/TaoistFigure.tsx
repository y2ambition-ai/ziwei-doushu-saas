export function TaoistFigure({ className }: { className?: string }) {
  const stroke = "#1A0F05";
  const sw = 1.4;
  const sw2 = 0.8;

  return (
    <svg
      viewBox="0 0 260 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* === STAFF (拂尘) === */}
      <line x1="228" y1="10" x2="228" y2="520" stroke={stroke} strokeWidth={sw} opacity={0.7} />
      {/* Staff top circular ornament */}
      <circle cx="228" cy="32" r="20" stroke={stroke} strokeWidth={1.2} opacity={0.7} />
      <circle cx="228" cy="32" r="10" stroke={stroke} strokeWidth={0.8} opacity={0.6} />
      {/* Taiji lines on staff top */}
      <path d="M228,12 A20,20 0 0,1 228,52 A10,10 0 0,1 228,32 A10,10 0 0,0 228,12 Z" stroke={stroke} strokeWidth={0} fill={stroke} opacity={0.4} />
      <line x1="208" y1="32" x2="248" y2="32" stroke={stroke} strokeWidth={0.6} opacity={0.4} />

      {/* === HAT (道冠) === */}
      {/* Crown body */}
      <path d="M100 95 L88 128 L168 128 L156 95" stroke={stroke} strokeWidth={sw} />
      {/* Crown base brim */}
      <line x1="83" y1="128" x2="173" y2="128" stroke={stroke} strokeWidth={sw} />
      <line x1="80" y1="134" x2="176" y2="134" stroke={stroke} strokeWidth={1} opacity={0.7} />
      {/* Crown top decoration */}
      <path d="M100 95 Q128 75 156 95" stroke={stroke} strokeWidth={sw} />
      <ellipse cx="128" cy="88" rx="8" ry="10" stroke={stroke} strokeWidth={1} />
      {/* Crown detail lines */}
      <line x1="110" y1="105" x2="108" y2="128" stroke={stroke} strokeWidth={sw2} opacity={0.4} />
      <line x1="128" y1="95" x2="128" y2="128" stroke={stroke} strokeWidth={sw2} opacity={0.4} />
      <line x1="146" y1="105" x2="148" y2="128" stroke={stroke} strokeWidth={sw2} opacity={0.4} />

      {/* === HEAD === */}
      <ellipse cx="128" cy="162" rx="32" ry="30" stroke={stroke} strokeWidth={sw} />

      {/* Eyes (serene, slightly closed) */}
      <path d="M113 157 Q117 155 121 157" stroke={stroke} strokeWidth={1} fill="none" />
      <path d="M135 157 Q139 155 143 157" stroke={stroke} strokeWidth={1} fill="none" />

      {/* Nose */}
      <path d="M126 162 Q128 168 130 162" stroke={stroke} strokeWidth={0.7} fill="none" opacity={0.6} />

      {/* Mouth (slight serene smile) */}
      <path d="M120 172 Q128 177 136 172" stroke={stroke} strokeWidth={0.8} fill="none" opacity={0.7} />

      {/* Ear hints */}
      <path d="M96 158 Q93 163 96 170" stroke={stroke} strokeWidth={0.8} fill="none" opacity={0.5} />
      <path d="M160 158 Q163 163 160 170" stroke={stroke} strokeWidth={0.8} fill="none" opacity={0.5} />

      {/* === BEARD (须) === */}
      <path d="M110 188 Q103 205 107 225" stroke={stroke} strokeWidth={0.8} fill="none" opacity={0.55} />
      <path d="M118 192 Q113 212 115 234" stroke={stroke} strokeWidth={0.8} fill="none" opacity={0.55} />
      <path d="M128 194 Q128 218 128 240" stroke={stroke} strokeWidth={0.8} fill="none" opacity={0.55} />
      <path d="M138 192 Q143 212 141 234" stroke={stroke} strokeWidth={0.8} fill="none" opacity={0.55} />
      <path d="M146 188 Q153 205 149 225" stroke={stroke} strokeWidth={0.8} fill="none" opacity={0.55} />
      {/* Moustache */}
      <path d="M113 182 Q128 188 143 182" stroke={stroke} strokeWidth={1} fill="none" opacity={0.6} />

      {/* === COLLAR === */}
      <path d="M96 192 L128 218 L160 192" stroke={stroke} strokeWidth={sw} />
      {/* Collar fold lines */}
      <path d="M96 192 L90 210" stroke={stroke} strokeWidth={sw2} opacity={0.5} />
      <path d="M160 192 L166 210" stroke={stroke} strokeWidth={sw2} opacity={0.5} />

      {/* === ROBE BODY === */}
      {/* Outer robe silhouette */}
      <path d="M96 192 L42 390 L214 390 L160 192" stroke={stroke} strokeWidth={sw} />

      {/* Robe internal fold lines */}
      <line x1="96" y1="230" x2="58" y2="390" stroke={stroke} strokeWidth={sw2} opacity={0.3} />
      <line x1="108" y1="218" x2="82" y2="390" stroke={stroke} strokeWidth={sw2} opacity={0.3} />
      <line x1="118" y1="218" x2="105" y2="390" stroke={stroke} strokeWidth={sw2} opacity={0.3} />
      <line x1="138" y1="218" x2="152" y2="390" stroke={stroke} strokeWidth={sw2} opacity={0.3} />
      <line x1="148" y1="218" x2="175" y2="390" stroke={stroke} strokeWidth={sw2} opacity={0.3} />
      <line x1="160" y1="230" x2="198" y2="390" stroke={stroke} strokeWidth={sw2} opacity={0.3} />

      {/* === BELT/SASH (腰带) === */}
      <path d="M54 295 Q128 310 202 295" stroke={stroke} strokeWidth={sw} fill="none" />
      <path d="M56 300 Q128 315 200 300" stroke={stroke} strokeWidth={sw2} fill="none" opacity={0.5} />
      {/* Sash knot */}
      <ellipse cx="128" cy="318" rx="14" ry="9" stroke={stroke} strokeWidth={sw} fill="none" />
      {/* Knot loops */}
      <path d="M114 315 Q106 305 112 298" stroke={stroke} strokeWidth={0.8} fill="none" opacity={0.6} />
      <path d="M142 315 Q150 305 144 298" stroke={stroke} strokeWidth={0.8} fill="none" opacity={0.6} />

      {/* === LEFT SLEEVE / ARM === */}
      <path d="M58 250 Q20 295 8 328" stroke={stroke} strokeWidth={sw} />
      <path d="M62 258 Q24 303 12 336" stroke={stroke} strokeWidth={sw} />
      {/* Left sleeve cuff */}
      <path d="M8 328 Q10 340 12 336" stroke={stroke} strokeWidth={sw} />
      {/* Left hand */}
      <ellipse cx="10" cy="332" rx="14" ry="9" stroke={stroke} strokeWidth={sw} />
      {/* Fingers suggestion */}
      <line x1="1" y1="328" x2="-2" y2="322" stroke={stroke} strokeWidth={0.7} opacity={0.5} />
      <line x1="5" y1="325" x2="3" y2="318" stroke={stroke} strokeWidth={0.7} opacity={0.5} />
      <line x1="10" y1="323" x2="10" y2="316" stroke={stroke} strokeWidth={0.7} opacity={0.5} />

      {/* === RIGHT SLEEVE / ARM (holding staff) === */}
      <path d="M198 250 Q222 285 228 310" stroke={stroke} strokeWidth={sw} />
      <path d="M194 258 Q218 293 224 318" stroke={stroke} strokeWidth={sw} />
      {/* Right hand gripping staff */}
      <ellipse cx="228" cy="318" rx="14" ry="9" stroke={stroke} strokeWidth={sw} />

      {/* === ROBE BOTTOM (flowing hem) === */}
      <path
        d="M42 390 Q48 430 60 458 Q85 490 128 500 Q171 490 196 458 Q208 430 214 390"
        stroke={stroke}
        strokeWidth={sw}
      />
      {/* Hem fold details */}
      <path d="M60 458 Q65 475 72 488" stroke={stroke} strokeWidth={sw2} opacity={0.4} />
      <path d="M80 490 Q100 502 118 503" stroke={stroke} strokeWidth={sw2} opacity={0.4} />
      <path d="M196 458 Q191 475 184 488" stroke={stroke} strokeWidth={sw2} opacity={0.4} />
      <path d="M176 490 Q156 502 138 503" stroke={stroke} strokeWidth={sw2} opacity={0.4} />
      {/* Vertical hem folds */}
      <path d="M80 390 Q72 430 70 465" stroke={stroke} strokeWidth={sw2} opacity={0.3} />
      <path d="M100 390 Q96 440 95 480" stroke={stroke} strokeWidth={sw2} opacity={0.3} />
      <line x1="128" y1="390" x2="128" y2="500" stroke={stroke} strokeWidth={sw2} opacity={0.3} />
      <path d="M156 390 Q160 440 161 480" stroke={stroke} strokeWidth={sw2} opacity={0.3} />
      <path d="M176 390 Q184 430 186 465" stroke={stroke} strokeWidth={sw2} opacity={0.3} />

      {/* === SHOES (云履) === */}
      <path d="M80 498 Q65 508 58 515 Q72 522 90 514 Q100 508 98 498" stroke={stroke} strokeWidth={sw} fill="none" />
      <path d="M176 498 Q191 508 198 515 Q184 522 166 514 Q156 508 158 498" stroke={stroke} strokeWidth={sw} fill="none" />
    </svg>
  );
}