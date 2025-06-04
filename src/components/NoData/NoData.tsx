import React from 'react';
import { Empty } from 'antd';


interface NoDataProps {
  description?: string;
  className?: string;
}

const NoData: React.FC<NoDataProps> = ({
  description = 'Không có dữ liệu',
  className = '', 
}) => {
    return (
      <Empty
        description={description}
        className={`flex flex-col h-[75dvh] md:h-[82dvh] lg:h-auto pointer-events-none items-center justify-center ${className}`}
      />
    );
  };
export default NoData;
