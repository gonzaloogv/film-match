import type React from "react";
import type { ButtonProps } from "../../types";

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const standard = 'rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyle = {
        primary:
        'bg-secondary text-primary-light hover:bg-button-hover',

        secondary:
        'bg-button-secondary-bg text-secondary border-1 border-secondary hover:bg-transparent/10',
        
        danger:
        'bg-rose-500 text-white hover:bg-rose-600'
    };

    const sizeStyle = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const computedClassName = `
        ${standard}
        ${variantStyle[variant]}
        ${sizeStyle[size]}
        ${className}
    `;

    return (
        <button className={computedClassName.trim()} {...props}>
            {children}
        </button>
  );
}