/** @jsx createElement */
import { createElement, useState } from './jsx-runtime';

interface ButtonProps {
  onClick?: (e: MouseEvent) => void;
  className?: string;
  title?: string;
  children?: any;
}
const Button = ({ onClick, className = '', title, children }: ButtonProps) => (
  <button className={className} onClick={onClick} title={title}>{children}</button>
);

interface CounterProps { initialCount?: number; }

export const Counter = ({ initialCount = 0 }: CounterProps) => {
  const [getCount, setCount] = useState<number>(initialCount);
  return (
    <div className="counter">
      <h2>Count: {String(getCount())}</h2>
      <div className="buttons">
        <Button onClick={() => setCount((c:number) => c + 1)} title="+1">+</Button>
        <Button onClick={() => setCount((c:number) => c - 1)} title="-1">-</Button>
        <Button onClick={() => setCount(initialCount)}>Reset</Button>
      </div>
    </div>
  );
};
