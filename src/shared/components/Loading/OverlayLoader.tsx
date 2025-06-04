import { Spin } from 'antd';
import React, { ReactNode } from 'react';

type OverlayLoaderProps = {
  spinning: boolean;
  children: ReactNode;
};

const OverlayLoader: React.FC<OverlayLoaderProps> = ({ spinning, children }) => {
  return (
    <div className='relative h-full w-full'>
      {spinning && (
        <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-25 z-50'>
          <Spin size='large' tip='Đang tải dữ liệu...' />
        </div>
      )}
      <div className={spinning ? 'opacity-50 pointer-events-none' : ''}>{children}</div>
    </div>
  );
};

export default OverlayLoader;
