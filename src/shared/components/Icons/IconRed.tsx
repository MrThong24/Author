
import React from 'react';

interface IconGreenProps {
  icon: React.ReactNode;
}

export default function IconRed({ icon }: IconGreenProps) {
  return (
    <div className='bg-[#FEF3F2] p-2 rounded-[50%]'>
    <div className='bg-[#FEE4E2] p-2 rounded-[50%]'>
      {icon}
    </div>
  </div>
  );
}
