'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

interface AnimatedDivProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  hasBackground?: boolean;
  style?: React.CSSProperties;
  delay?: number;
  scrollOffset?: number;
}

export default function AnimatedDiv({
  children,
  className = '',
  contentClassName = '',
  hasBackground = false,
  style,
  delay = 0,
  scrollOffset = 0,
}: AnimatedDivProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const bottomMargin = -100 - scrollOffset;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: `0px 0px ${bottomMargin}px 0px`,
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isVisible, scrollOffset]);

  const animationClass = isVisible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-10';

  const delayStyle = delay > 0 ? { transitionDelay: `${delay}ms` } : {};

  if (hasBackground) {
    return (
      <div
        ref={(node) => {
          ref.current = node;
        }}
        className={className}
        style={style}
      >
        <div
          className={`transition-all duration-1000 ${animationClass} ${contentClassName}`}
          style={delayStyle}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={(node) => {
        ref.current = node;
      }}
      className={`transition-all duration-1000 ${animationClass} ${className}`}
      style={{ ...style, ...delayStyle }}
    >
      {children}
    </div>
  );
}
