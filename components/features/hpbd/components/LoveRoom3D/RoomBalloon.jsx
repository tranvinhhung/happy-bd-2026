export default function RoomBalloon({ color }) {
  return (
    <svg viewBox="0 0 70 180" aria-hidden="true">
      <path d="M35 76 C17 110 53 129 32 174" fill="none" stroke="#f4dce9" strokeWidth="1.5" opacity=".6" />
      <ellipse cx="35" cy="39" rx="25" ry="32" fill={color} />
      <path d="M35 70 l-5 8 h10Z" fill={color} />
      <path d="M21 21 Q15 29 17 41" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}

