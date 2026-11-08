
"use client";

import { useEffect, useState } from 'react';
import { Heart, Star, Circle, Book, Square } from 'lucide-react';

type ElementType = 'star' | 'heart' | 'circle' | 'book' | 'square' | 'line';

interface FloatingElementProps {
  type: ElementType;
  colorClass: string;
  sizeClass: string;
  style: React.CSSProperties;
  animationDelay: string;
  animationDuration: string;
}

const ElementComponent: React.FC<FloatingElementProps> = ({ type, colorClass, sizeClass, style, animationDelay, animationDuration }) => {
  const Icon = type === 'star' ? Star : 
               type === 'heart' ? Heart : 
               type === 'book' ? Book :
               type === 'square' ? Square :
               type === 'line' ? () => <div className="w-full h-0.5 bg-current" /> :
               Circle;
               
  return (
    <Icon
      className={`${colorClass} ${sizeClass} absolute animate-float opacity-40`}
      style={{ ...style, animationDelay, animationDuration }}
      fill={['heart', 'star', 'square'].includes(type) ? 'currentColor' : 'none'}
    />
  );
};

interface FloatingElementsContainerProps {
  count?: number;
  elementTypes?: ElementType[];
  colorClasses?: string[];
}

const FloatingElements: React.FC<FloatingElementsContainerProps> = ({ 
  count = 10, 
  elementTypes = ['star', 'heart', 'circle'],
  colorClasses = ['text-accent', 'text-accent-blue-DEFAULT', 'text-primary/70'] 
}) => {
  const [elements, setElements] = useState<FloatingElementProps[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const newElements: FloatingElementProps[] = [];
    for (let i = 0; i < count; i++) {
      const type = elementTypes[Math.floor(Math.random() * elementTypes.length)];
      const colorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
      const size = type === 'line' ? Math.random() * 80 + 40 : Math.random() * 20 + 12;
      newElements.push({
        type,
        colorClass,
        sizeClass: '',
        style: {
          left: `${(i / count) * 90 + Math.random() * 10}%`,
          top: `${Math.random() * 85 + 5}%`,
          transform: type === 'line' ? `rotate(${Math.random() * 180}deg)` : undefined,
          width: `${Math.round(size)}px`,
          height: type === 'line' ? '2px' : `${Math.round(size)}px`,
        },
        animationDelay: `${(Math.random() * 4).toFixed(1)}s`,
        animationDuration: `${(Math.random() * 4 + 4).toFixed(1)}s`,
      });
    }
    setElements(newElements);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {elements.map((el, index) => (
        <ElementComponent key={index} {...el} />
      ))}
    </div>
  );
};

export default FloatingElements;
