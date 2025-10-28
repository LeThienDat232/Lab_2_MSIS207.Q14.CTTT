/** @jsx createElement */
import { createElement, createFragment } from './jsx-runtime';

export interface BaseProps {
  key?: any;
  className?: string;
  style?: string | Record<string, any>;
  children?: any;
}

/* Card */
export interface CardProps extends BaseProps {
  title?: string;
  onClick?: (e: MouseEvent) => void;
}
export const Card = ({ title, className = '', style, onClick, children }: CardProps) => (
  <div className={`card ${className}`} style={style} onClick={onClick}>
    {title && <div className="card-title">{title}</div>}
    <div className="card-body">{children}</div>
  </div>
);

/* Modal */
export interface ModalProps extends BaseProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
}
export const Modal = ({ isOpen, title, onClose, className = '', style, children }: ModalProps) => {
  if (!isOpen) return createFragment(null) as any;
  const closeIfOverlay = (e: any) => { if (e.target === e.currentTarget) onClose(); };
  return (
    <div className={`modal-overlay ${className}`} style={style} onClick={closeIfOverlay}>
      <div className="modal">
        {title && <div className="modal-title">{title}</div>}
        <div className="modal-body">{children}</div>
        <button className="modal-close" onClick={() => onClose()}>Close</button>
      </div>
    </div>
  );
};

/* Form */
export interface FormProps extends BaseProps { onSubmit: (e: Event) => void; }
export const Form = ({ onSubmit, className = '', style, children }: FormProps) => (
  <form className={className} style={style} onSubmit={(e: any) => { e.preventDefault(); onSubmit(e); }}>
    {children}
  </form>
);

/* Input */
export interface InputProps extends BaseProps {
  type?: string;
  name?: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string, e: Event) => void;
}
export const Input = ({ type = 'text', name, value, placeholder, disabled, className = '', style, onChange }: InputProps) => (
  <input
    type={type}
    name={name}
    className={className}
    style={style}
    value={value}
    placeholder={placeholder}
    disabled={!!disabled}
    onInput={(e: any) => onChange(e.target.value, e)}
  />
);
