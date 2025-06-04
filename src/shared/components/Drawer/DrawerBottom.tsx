import React, { ReactNode, useEffect } from 'react';
import { BsChevronRight } from 'react-icons/bs';
import { IoCloseSharp } from 'react-icons/io5';
import useDisableScroll from 'src/hooks/useDisableScroll';

interface DrawerBottomProps {
  isOpen: boolean;
  toggleDrawer: () => void;
  children: ReactNode;
  title: string;
  linkTitle?: string;
  handleNavigate?: () => void;
  backgroundColor?: string;

}

const DrawerBottom: React.FC<DrawerBottomProps> = ({
  isOpen,
  toggleDrawer,
  children,
  title,
  linkTitle,
  handleNavigate,
  backgroundColor = 'bg-main'
}) => {
  useDisableScroll(isOpen);

  return (
    <div
      className={`h-full fixed bottom-0 left-0 right-0 z-[101] w-full ${backgroundColor} transition-all duration-500 ease-in-out transform ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-labelledby='drawer-bottom-label'
    >
      <div className='w-full h-16 px-4 flex items-center justify-between border-b border-gray-300 bg-main'>
        <div className='flex flex-col items-start justify-center'>
          <h5 id='drawer-bottom-label' className='text-base font-semibold text-primary'>
            {title}
          </h5>
          {linkTitle && (
            <p className='flex gap-1 items-center text-sm text-primary cursor-pointer' onClick={handleNavigate}>
              {linkTitle} <BsChevronRight size={13} className='mt-[2px]'/>
            </p>
          )}
        </div>

        <div
          onClick={toggleDrawer}
          className='text-gray-400 text-sm w-8 h-8 inline-flex items-center justify-center cursor-pointer'
        >
          <IoCloseSharp size={30} />
          <span className='sr-only'>Close menu</span>
        </div>
      </div>

      {/* Content section */}
      <div className='flex-1 overflow-y-auto' style={{ maxHeight: 'calc(100dvh - 56px)' }}>
        {children}
      </div>
    </div>
  );
};

export default DrawerBottom;
