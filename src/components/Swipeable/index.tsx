import React, { useEffect, useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { RiDeleteBin6Line } from 'react-icons/ri';

let openedItemId: string | number | null = null;
const listeners: Record<string | number, () => void> = {};

interface SwipeableProps {
  children: React.ReactNode;
  onDelete: (id: string | number) => void;
  id: string | number;
  onDragStateChange?: (isDragging: boolean) => void;
  threshold?: number;
}

const Swipeable: React.FC<SwipeableProps> = ({ children, onDelete, id, onDragStateChange, threshold = 70 }) => {
  const controls = useAnimation();

  useEffect(() => {
    listeners[id] = () => {
      controls.start({ x: 0 });
    };
    return () => {
      delete listeners[id];
    };
  }, [id]);

  const handleDragStart = () => {
    onDragStateChange?.(true);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    onDragStateChange?.(false);

    if (info.offset.x < -threshold) {
      // Nếu mở một item mới, đóng cái cũ
      if (openedItemId !== id) {
        Object.entries(listeners).forEach(([key, close]) => {
          if (key !== String(id)) close(); // đóng các item khác
        });
      }
      openedItemId = id;
      controls.start({ x: -threshold });
    } else {
      if (openedItemId === id) {
        openedItemId = null;
      }
      controls.start({ x: 0 });
    }
  };

  return (
    <div className='relative overflow-hidden shadow-sm rounded-md'>
      <motion.div
        drag='x'
        dragConstraints={{ left: -threshold, right: 0 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={controls}
        className='relative z-10 p-2 bg-white '
      >
        {children}
      </motion.div>
      <div
        className={`absolute top-0 bottom-0 flex items-center justify-center right-0 h-full w-[${threshold}px] bg-firestormRed  cursor-pointer`}
        onClick={() => {
          onDelete(id);
          openedItemId = null;
        }}
      >
        <RiDeleteBin6Line size={22} color={'white'} />
      </div>
    </div>
  );
};

export default Swipeable;
