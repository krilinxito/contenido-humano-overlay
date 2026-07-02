interface MarqueeTextProps {
  text: string;
  className?: string;
}

/** Marquee con CSS @keyframes (nunca el tag <marquee>, ver DESIGN_SYSTEM.md). */
export function MarqueeText({ text, className = '' }: MarqueeTextProps) {
  return (
    <div className={`marquee ${className}`}>
      <span className="marquee-inner">{text}</span>
    </div>
  );
}
