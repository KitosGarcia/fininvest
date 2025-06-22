import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Componente de botão com efeito de brilho e hover
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  icon,
  fullWidth = false,
}: ButtonProps) => {
  // Definir classes base com base na variante
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
      case 'accent':
        return 'bg-accent text-accent-foreground hover:bg-accent/90';
      case 'destructive':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
      case 'outline':
        return 'bg-transparent border border-border text-foreground hover:bg-muted/50';
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
    }
  };

  // Definir classes de tamanho
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'py-1.5 px-3 text-sm';
      case 'md':
        return 'py-2.5 px-4';
      case 'lg':
        return 'py-3 px-6 text-lg';
      default:
        return 'py-2.5 px-4';
    }
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-lg font-medium transition-all duration-300 ease-in-out
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
        ${variant === 'primary' && !disabled ? 'hover:animate-pulse-glow' : ''}
        ${className}
        flex items-center justify-center gap-2
      `}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.button>
  );
};

// Componente de card com efeito de glassmorphism
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className = '', hover = false }: CardProps) => {
  return (
    <motion.div
      className={`
        glass rounded-xl p-6 border border-border
        ${hover ? 'hover:border-primary/50 transition-all duration-300' : ''}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -5, boxShadow: '0 10px 30px -15px rgba(0, 0, 0, 0.5)' } : {}}
    >
      {children}
    </motion.div>
  );
};

// Componente de input com animação e estilo futurista
interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
  required?: boolean;
}

export const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  error,
  className = '',
  required = false,
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <motion.input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full ${icon ? 'pl-10' : 'pl-4'} py-3 
            bg-muted/50 border rounded-lg 
            focus:outline-none transition-all duration-300
            ${error ? 'border-destructive' : isFocused ? 'border-primary ring-1 ring-primary' : 'border-border'}
          `}
          initial={{ borderColor: 'hsl(var(--border))' }}
          animate={{ 
            borderColor: error 
              ? 'hsl(var(--destructive))' 
              : isFocused 
                ? 'hsl(var(--primary))' 
                : 'hsl(var(--border))'
          }}
        />
      </div>
      {error && <p className="text-destructive text-sm mt-1">{error}</p>}
    </div>
  );
};

// Componente de badge com animação
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'destructive' | 'success' | 'warning';
  className?: string;
}

export const Badge = ({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) => {
  // Definir classes base com base na variante
  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'bg-muted text-muted-foreground';
      case 'primary':
        return 'bg-primary/20 text-primary';
      case 'secondary':
        return 'bg-secondary/20 text-secondary';
      case 'accent':
        return 'bg-accent/20 text-accent';
      case 'destructive':
        return 'bg-destructive/20 text-destructive';
      case 'success':
        return 'bg-green-500/20 text-green-500';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <motion.span
      className={`
        inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
        ${getVariantClasses()}
        ${className}
      `}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.span>
  );
};

// Componente de loading com animação
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'white';
  className?: string;
}

export const Loading = ({
  size = 'md',
  color = 'primary',
  className = '',
}: LoadingProps) => {
  // Definir tamanho
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-8 h-8';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-8 h-8';
    }
  };

  // Definir cor
  const getColor = () => {
    switch (color) {
      case 'primary':
        return 'border-primary';
      case 'secondary':
        return 'border-secondary';
      case 'accent':
        return 'border-accent';
      case 'white':
        return 'border-white';
      default:
        return 'border-primary';
    }
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <motion.div
        className={`${getSize()} rounded-full border-2 ${getColor()} border-t-transparent`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

// Componente de tooltip com animação
interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip = ({
  children,
  content,
  position = 'top',
  className = '',
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Definir posição
  const getPosition = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2';
    }
  };

  return (
    <div className="relative inline-block" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <motion.div
          className={`absolute z-50 ${getPosition()} px-3 py-2 text-sm rounded-lg glass border border-border whitespace-nowrap ${className}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {content}
        </motion.div>
      )}
    </div>
  );
};

// Componente de notificação com animação
interface NotificationProps {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
  duration?: number; // em milissegundos
  className?: string;
}

export const Notification = ({
  title,
  message,
  type = 'info',
  onClose,
  duration = 5000, // 5 segundos por padrão
  className = '',
}: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) setTimeout(onClose, 300); // Aguardar a animação de saída
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Definir cor com base no tipo
  const getTypeClasses = () => {
    switch (type) {
      case 'info':
        return 'border-primary/50 bg-primary/10';
      case 'success':
        return 'border-green-500/50 bg-green-500/10';
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'error':
        return 'border-destructive/50 bg-destructive/10';
      default:
        return 'border-primary/50 bg-primary/10';
    }
  };

  // Definir ícone com base no tipo
  const getTypeIcon = () => {
    switch (type) {
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`fixed top-4 right-4 z-50 max-w-md glass border rounded-lg p-4 shadow-lg ${getTypeClasses()} ${className}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getTypeIcon()}</div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-1 text-sm text-muted-foreground">{message}</div>
        </div>
        <button
          type="button"
          className="ml-4 inline-flex text-muted-foreground hover:text-foreground"
          onClick={() => {
            setIsVisible(false);
            if (onClose) setTimeout(onClose, 300);
          }}
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

// Exportar todos os componentes
export { 
  Button, 
  Card, 
  Input, 
  Badge, 
  Loading, 
  Tooltip, 
  Notification 
};
