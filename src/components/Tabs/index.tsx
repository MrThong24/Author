import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "antd";

interface TabProps {
  label: string;
  key: string;
  content?: string;
  badge?: number; // Optional badge number
}

export default function BaseTabs({
  tabs,
  className,
  onChange,
  onAnimationEnd,
  disabled = false,
  activeKey, // Add this prop
}: {
  tabs: TabProps[];
  className?: string;
  onChange?: (key: string) => void;
  onAnimationEnd?: (key: string) => void;
  disabled?: boolean;
  activeKey?: string; // Add this type
}) {
  // Use activeKey if provided, otherwise use internal state
  const [internalTab, setInternalTab] = useState(tabs[0]);
  const tab = activeKey
    ? tabs.find((t) => t.key === activeKey) || tabs[0]
    : internalTab;

  return (
    <div className={`my-2 ${className || ""}`}>
      <div className="space-y-2">
        {/* Menu items */}
        <div className="flex w-fit rounded-md bg-[#EEECEC] items-center space-x-4 overflow-x-auto p-[6px]">
          {tabs.map((item, idx) => (
            <button
              key={idx}
              className="relative py-[2px]"
              onClick={() => {
                if (disabled) return;
                if (!activeKey) setInternalTab(item);
                onChange?.(item.key);
              }}
            >
              <AnimatePresence>
                {tab.key === item.key && (
                  <motion.div
                    layoutId="tab-example-pointer"
                    className="absolute inset-0 bottom-0 h-full w-full bg-white backdrop-blur rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onLayoutAnimationComplete={() => {
                      onAnimationEnd?.(item.key);
                    }}
                  />
                )}
              </AnimatePresence>
              <div className="relative z-[1] flex items-center space-x-2 px-3 py-1 font-medium ">
                {!item.badge && (
                  <span
                    className={` ${tab.key === item.key ? "text-primary" : "text-gray-500"}`}
                  >
                    {item.label}
                  </span>
                )}
                {!!item.badge && (
                  <Badge
                    count={item.badge}
                    offset={[6, 0]}
                    className="py-[4px]"
                  >
                    <span
                      className={` ${tab.key === item.key ? "text-primary" : "text-gray-500"}`}
                    >
                      {item.label}
                    </span>
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        {tab.content && <div className="px-4 py-5">{tab.content}</div>}
      </div>
    </div>
  );
}
