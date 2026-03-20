'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: string;
  duration?: number;
  className?: string;
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function parseValue(value: string): { numeric: number; suffix: string; prefix: string } {
  const prefixMatch = value.match(/^([^0-9]*)/);
  const prefix = prefixMatch ? prefixMatch[1] : '';

  const stripped = value.slice(prefix.length);
  const numericMatch = stripped.match(/^[\d,]+/);
  const rawNumericStr = numericMatch ? numericMatch[0] : '0';
  const numeric = parseInt(rawNumericStr.replace(/,/g, ''), 10) || 0;

  const suffix = stripped.slice(rawNumericStr.length);

  return { numeric, suffix, prefix };
}

export function AnimatedCounter({
  value,
  duration = 2000,
  className,
}: AnimatedCounterProps): React.ReactNode {
  const { numeric, suffix, prefix } = parseValue(value);
  const [display, setDisplay] = useState<string>(value);
  const hasAnimatedRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || hasAnimatedRef.current) return;

        hasAnimatedRef.current = true;
        observer.disconnect();

        const startTime = performance.now();

        const tick = (now: number): void => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = easeOutQuart(progress);
          const current = Math.round(eased * numeric);

          setDisplay(`${prefix}${current.toLocaleString()}${suffix}`);

          if (progress < 1) {
            rafRef.current = requestAnimationFrame(tick);
          } else {
            setDisplay(`${prefix}${numeric.toLocaleString()}${suffix}`);
          }
        };

        rafRef.current = requestAnimationFrame(tick);
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [numeric, suffix, prefix, duration]);

  return (
    <span ref={containerRef} className={className}>
      {display}
    </span>
  );
}
