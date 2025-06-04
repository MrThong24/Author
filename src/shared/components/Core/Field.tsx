import React from "react";

interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

const Field: React.FC<LabelProps> = ({ children, className }) => {
  return (
    <div className={`flex flex-col flex-1 gap-y-2 ${className}`}>
      {children}
    </div>
  );
};

export default Field;
