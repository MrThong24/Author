import React from "react";
import { twMerge } from "tailwind-merge";

interface LabelProps {
  text: string;
  validate?: boolean;
  className?: string;
}

const Label: React.FC<LabelProps> = ({ text, validate, className }) => {
  return (
    <p
      className={twMerge("text-base text-gray-700 font-medium mb-1", className)}
    >
      {text} {validate && <span className="text-red-500">*</span>}
    </p>
  );
};

export default Label;
