import React from 'react';

interface IconGreenProps {
  icon: React.ReactNode;
}

export default function IconGreen({ icon }: IconGreenProps) {
  return (
    <div className='bg-[#e2ffec] p-2 rounded-[50%]'>
      <div className='bg-[#c6f8d7] p-2 rounded-[50%]'>
        {icon}
      </div>
    </div>
  );
}
