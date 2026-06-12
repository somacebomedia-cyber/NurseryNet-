
import { cn } from '@/lib/utils';

interface Stripe {
  color: string;
  height: string;
  offsetTop?: string;
  offsetLeft?: string;
  rotation?: string;
  blur?: string;
  opacity?: string;
  borderRadius?: string;
  isGradient?: boolean;
}

const ColorfulStripes = ({ className }: { className?: string }) => {
  const stripes: Stripe[] = [
    { color: 'bg-accent', height: 'h-32', offsetTop: 'top-10', offsetLeft: '-left-1/4', rotation: '-rotate-6', borderRadius: 'rounded-[50px]', opacity: 'opacity-70' },
    { color: 'bg-accent-blue-DEFAULT', height: 'h-40', offsetTop: 'top-1/4', offsetLeft: 'left-1/4', rotation: 'rotate-3', borderRadius: 'rounded-[60px]', opacity: 'opacity-60'  },
    { color: 'bg-primary/70', height: 'h-24', offsetTop: 'top-1/2', offsetLeft: '-left-1/6', rotation: '-rotate-2', borderRadius: 'rounded-[40px]', opacity: 'opacity-75'  },
    { color: 'bg-secondary', height: 'h-36', offsetTop: 'top-3/4', offsetLeft: 'left-1/3', rotation: 'rotate-4', borderRadius: 'rounded-[55px]', opacity: 'opacity-70' },
  ];

  return (
    <div className={cn("absolute inset-0 overflow-hidden -z-10", className)}>
      {stripes.map((stripe, index) => (
        <div
          key={index}
          className={cn(
            'absolute w-[150%] transform',
            stripe.color,
            stripe.height,
            stripe.offsetTop,
            stripe.offsetLeft,
            stripe.rotation,
            stripe.borderRadius,
            stripe.opacity,
            stripe.isGradient ? 'bg-gradient-to-r from-accent to-accent-blue-DEFAULT' : ''
          )}
          style={{
            filter: stripe.blur ? `blur(${stripe.blur})` : 'none',
          }}
        />
      ))}
    </div>
  );
};

export default ColorfulStripes;

    
