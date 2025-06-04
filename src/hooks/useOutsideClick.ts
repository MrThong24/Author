import { useEffect, useRef } from 'react';

interface UseOutsideClickProps {
  isOpen: boolean;
  onClose: () => void;
  excludeClass?: string;
}

export const useOutsideClick = ({ isOpen, onClose, excludeClass }: UseOutsideClickProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;
      
      const target = event.target as HTMLElement;
      const isExcluded = excludeClass && target.closest(`.${excludeClass}`);
      
      if (ref.current && !ref.current.contains(target) && !isExcluded) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, excludeClass]);

  return ref;
}