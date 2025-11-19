import type React from "react";
import type { CardProps } from "../../types";
import { useTheme } from "../../hooks";

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding = 'md',
    ...props
}) => {
    const { theme } = useTheme();
    
    const standard = 'rounded-lg shadow-md transition-all duration-300';
    
    const variantStyle = {
        default: theme === 'light' 
            ? 'bg-primary-light text-primary-dark'
            : 'bg-secondary-dark text-primary-light',
        highlighted: theme === 'light'
            ? 'bg-card-highlighted-light-bg border-1 border-secondary text-primary-dark'
            : 'bg-card-highlighted-dark-bg border-1 border-secondary text-primary-light'
    };

    const paddingStyle = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const className = `
        ${standard}
        ${variantStyle[variant]}
        ${paddingStyle[padding]}
    `;

    return (
        <div className={className.trim()} {...props}>
            {children}
        </div>
    );
};