/** @jsx createElement */
import { createElement, VNode } from './jsx-runtime';

export interface ButtonProps {
  onClick?: (e: MouseEvent) => void;
  className?: string;
  title?: string;
  children?: any;
}

const Button = ({ onClick, className = '', title, children }: ButtonProps): VNode => {
  return (
    <button className={className} onClick={onClick} title={title}>
      {children}
    </button>
  ) as unknown as VNode;
};

export { Button };
