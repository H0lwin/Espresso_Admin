import { Coffee } from 'lucide-react';
import type { SVGProps } from 'react';

// Simple SVG coffee bean logo
const CoffeeBeanIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12,2A10,10,0,0,0,5.12,4.77A10,10,0,0,0,12,22a10,10,0,0,0,6.88-17.23A10,10,0,0,0,12,2Z" />
    <path d="M12,2c-2.9,2.9-3.13,6.14-1,9.44s4.43,4.76,7.32,1.87" />
  </svg>
);


export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };
  const iconSizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div className="flex items-center gap-2 text-secondary">
      <CoffeeBeanIcon className={`${iconSizeClasses[size]} text-primary`} />
      <span className={`font-headline font-semibold ${sizeClasses[size]}`}>
        Espresso Edge
      </span>
    </div>
  );
}
