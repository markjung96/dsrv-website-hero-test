'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

interface AnimatedCounterProps {
  value: string;
  className?: string;
  duration?: number;
}

export default function AnimatedCounter({
  value,
  className = '',
  duration = 1000
}: AnimatedCounterProps) {
  const parseValue = (val: string) => {
    const match = val.match(/(\d+)(.*)/);
    if (match) {
      return {
        number: parseInt(match[1], 10),
        suffix: match[2] || ''
      };
    }
    return null;
  };

  const parsed = useMemo(() => parseValue(value), [value]);
  const initialValue = useMemo(() => {
    return parsed ? `0${parsed.suffix}` : value;
  }, [parsed, value]);

  const [displayValue, setDisplayValue] = useState<string>(initialValue);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (parsed) {
      setDisplayValue(`0${parsed.suffix}`);
    } else {
      setDisplayValue(value);
    }
    hasAnimatedRef.current = false;
  }, [value, parsed]);

  useEffect(() => {
    if (!parsed || !ref.current) {
      return;
    }

    const startAnimation = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;
      startTimeRef.current = Date.now();

      const animate = () => {
        if (!startTimeRef.current || !parsed) return;

        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        const easedProgress = 1 - Math.pow(1 - progress, 3);

        if (progress < 1) {
          const currentNum = Math.floor(parsed.number * easedProgress);
          setDisplayValue(`${currentNum}${parsed.suffix}`);
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
        }
      };

      animate();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAnimation();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    const currentRef = ref.current;

    if (currentRef) {
      const rect = currentRef.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible) {
        startAnimation();
      } else {
        observer.observe(currentRef);
      }
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration, parsed]);

  if (!parsed) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}
