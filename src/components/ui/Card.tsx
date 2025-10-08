import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

const CardHeader = ({ children, className }: CardHeaderProps) => {
  return (
    <div
      className={clsx('px-6 py-4 border-b border-gray-200', className)}
    >
      {children}
    </div>
  );
};

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

const CardContent = ({ children, className }: CardContentProps) => {
  return <div className={clsx('p-6', className)}>{children}</div>;
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

const CardFooter = ({ children, className }: CardFooterProps) => {
  return (
    <div
      className={clsx(
        'px-6 py-4 bg-gray-50 border-t border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
};

export { Card, CardHeader, CardContent, CardFooter };