import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { CgMenuRound } from "react-icons/cg";
import { ReactNode, useState, useEffect } from "react";
import { Tooltip } from "antd";

interface DraggableButtonProps {
  handleToggleSidebar: () => void;
  icon?: ReactNode;
  hasNewNotification?: boolean;
}

export const DraggableButton: React.FC<DraggableButtonProps> = ({
  handleToggleSidebar,
  icon,
  hasNewNotification,
}) => {
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [bounds, setBounds] = useState({
    top: 10,
    left: 0,
    right: 0,
    bottom: 0,
  });
  const [isPositionInitialized, setIsPositionInitialized] = useState(false);
  const [tooltipPlacement, setTooltipPlacement] = useState<"left" | "right">(
    "right"
  );
  const [isDragging, setIsDragging] = useState(false);
  const [hasSeenNotification, setHasSeenNotification] = useState(false); // New state to track if user has seen notification

  const clickThreshold = 5;
  const buttonWidth = 35;

  useEffect(() => {
    updateBounds();
    const initialX = window.innerWidth - buttonWidth - 10;
    const initialY = window.innerHeight - 120;
    setPosition({ x: initialX, y: initialY });
    setTooltipPlacement("left"); // Default tooltip placement
    setIsPositionInitialized(true);

    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, []);

  useEffect(() => {
    if (hasNewNotification) {
      setHasSeenNotification(false); // Reset when new notification appears
    }
  }, [hasNewNotification]);

  const updateBounds = () => {
    setBounds({
      left: 0,
      top: 10,
      right: window.innerWidth - buttonWidth,
      bottom: window.innerHeight - buttonWidth,
    });
  };

  const handleStart = (e: DraggableEvent, data: DraggableData) => {
    setStartPos({ x: data.x, y: data.y });
    setIsDragging(true); // Hide tooltip when dragging starts
  };

  const handleStop = (e: DraggableEvent, data: DraggableData) => {
    setIsDragging(false); // Show tooltip when dragging stops

    const dist = Math.sqrt(
      (data.x - startPos.x) ** 2 + (data.y - startPos.y) ** 2
    );
    if (dist < clickThreshold) {
      handleToggleSidebar();
      setHasSeenNotification(true); // Hide notification indicator and tooltip after clicking
      return;
    }

    const screenWidth = window.innerWidth;
    const snapX =
      data.x < screenWidth / 2 ? 10 : screenWidth - buttonWidth - 10;

    setPosition({ x: snapX, y: data.y });

    // Adjust tooltip placement based on position
    setTooltipPlacement(snapX === 10 ? "right" : "left");
  };

  if (!isPositionInitialized) {
    return null;
  }

  return (
    <Draggable
      bounds={bounds}
      position={position}
      onStart={handleStart}
      onStop={handleStop}
    >
      <div className="fixed bg-primary text-[#EFF6FF] rounded-full shadow-md z-[100] flex items-center justify-center w-[35px] h-[35px] cursor-move">
        <Tooltip
          placement={tooltipPlacement}
          title="Bạn có thông báo mới"
          open={hasNewNotification && !hasSeenNotification && !isDragging}
        >
          <div className="relative flex items-center justify-center w-full h-full">
            {/* Show the red dot only if there's a new notification and the user hasn't clicked the button */}
            {hasNewNotification && !hasSeenNotification && (
              <div className="absolute top-0 right-0 w-[10px] h-[10px] bg-red-600 rounded-full"></div>
            )}
            {icon || <CgMenuRound size={28} />}
          </div>
        </Tooltip>
      </div>
    </Draggable>
  );
};
